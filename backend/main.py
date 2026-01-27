from fastapi import FastAPI, Depends, File, UploadFile, Form, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Boolean, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta
from typing import Optional
import os
import cloudinary
import cloudinary.uploader
import resend 
import google.generativeai as genai 

# --- IMPORTAÇÕES PARA AUTH ---
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import RedirectResponse
from pydantic import BaseModel

# Bibliotecas de Segurança
from passlib.context import CryptContext
from jose import JWTError, jwt

# --- CONFIGURAÇÃO DO BANCO DE DADOS ---
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./financeiro.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SEGURANÇA CONFIG ---
SECRET_KEY = os.getenv("SECRET_KEY", "chave_secreta_do_lincoln")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30 # Token dura 30 dias agora

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- CONFIGURAÇÃO DO RESEND (EMAIL) ---
resend.api_key = os.getenv("RESEND_API_KEY")

# --- MODELOS ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    avatar_url = Column(String, nullable=True)
    
    # MODIFICAÇÃO: PREMIUM POR PADRÃO
    is_premium = Column(Boolean, default=True) 

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))

class Pagamento(Base):
    __tablename__ = "pagamentos"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    valor = Column(Float)
    categoria = Column(String) 
    data_pagamento = Column(DateTime, default=datetime.utcnow)
    comprovante_path = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id")) 

class Recebimento(Base):
    __tablename__ = "recebimentos"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    valor = Column(Float)
    cliente = Column(String) 
    data_recebimento = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Recebido")
    owner_id = Column(Integer, ForeignKey("users.id"))

class Fornecedor(Base):
    __tablename__ = "fornecedores"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    email = Column(String)
    telefone = Column(String)
    categoria = Column(String)
    data_cadastro = Column(DateTime, default=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

class Documento(Base):
    __tablename__ = "documentos"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    categoria = Column(String)
    arquivo_url = Column(String)
    data_upload = Column(DateTime, default=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CONFIGURAÇÃO GOOGLE OAUTH ---
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET", "chave_sessao_padrao"))

oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"), 
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'} 
)

cloudinary.config(secure=True)

origins = [
    "http://localhost:3000",
    "https://lincoln-bugs-system.vercel.app", # Seu site novo
    "https://lincoln-bugs-system-git-main-willyang10xs-projects.vercel.app", # Previews da Vercel
    os.getenv("FRONTEND_URL") # Pega do ambiente também
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # <--- Agora sim!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- FUNÇÕES DE SEGURANÇA ---
def verify_password(plain_password, hashed_password):
    try:
        # Tenta verificar a senha
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Se o hash for inválido (ex: usuário do Google tentando login normal), retorna Falso
        return False

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)
    user = db.query(User).filter(User.email == email).first()
    if user is None: raise HTTPException(status_code=401)
    return user

# --- ROTAS DE PERFIL ---
@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    # Retorna sempre True para o front ficar feliz, mesmo se no banco estiver False
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "avatar_url": current_user.avatar_url,
        "is_premium": True 
    }

@app.put("/users/me/avatar")
async def update_avatar(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = cloudinary.uploader.upload(file.file)
    url = result.get("secure_url")
    current_user.avatar_url = url
    db.commit()
    return {"avatar_url": url}

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None

@app.put("/users/me")
async def update_user_data(user_data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_data.full_name: current_user.full_name = user_data.full_name
    if user_data.password:
        if len(user_data.password) < 4: raise HTTPException(status_code=400, detail="Senha curta")
        current_user.hashed_password = get_password_hash(user_data.password)
    db.commit()
    return {"message": "Atualizado"}

# --- ROTAS DE AUTENTICAÇÃO ---
@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401)
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "user_name": user.full_name, "is_premium": True}

@app.post("/auth/register")
def register_user(email: str = Form(...), password: str = Form(...), full_name: str = Form(...), db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == email).first(): raise HTTPException(status_code=400, detail="Email existe")
    hashed = get_password_hash(password)
    # CRIA COMO PREMIUM DIRETO
    new = User(email=email, full_name=full_name, hashed_password=hashed, is_premium=True)
    db.add(new)
    db.commit()
    return {"message": "Criado"}

@app.get("/auth/login/google")
async def login_google(request: Request):
    redirect_uri = str(request.url_for('auth_google_callback'))
    if "onrender.com" in redirect_uri and redirect_uri.startswith("http://"):
        redirect_uri = redirect_uri.replace("http://", "https://", 1)
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/google/callback")
async def auth_google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except:
        return RedirectResponse(url=f"{os.getenv('FRONTEND_URL')}/login?error=auth_failed")

    user_info = token.get('userinfo')
    email = user_info.get('email')
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # CRIA COMO PREMIUM
        user = User(email=email, full_name=user_info.get('name'), hashed_password="GOOGLE", avatar_url=user_info.get('picture'), is_premium=True)
        db.add(user)
    
    db.commit()
    access_token = create_access_token(data={"sub": user.email})
    return RedirectResponse(url=f"{os.getenv('FRONTEND_URL')}/auth-callback?token={access_token}")

# --- ROTA DE IA (DESBLOQUEADA) ---
@app.post("/system/analyze-finances")
async def analyze_finances(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # REMOVIDO BLOQUEIO DE PREMIUM AQUI
    
    pagamentos = db.query(Pagamento).filter(Pagamento.owner_id == current_user.id).order_by(Pagamento.data_pagamento.desc()).limit(50).all()
    if not pagamentos: return {"analysis": "Adicione gastos para analisar."}

    dados_texto = "Histórico:\n"
    total = 0
    for p in pagamentos:
        dados_texto += f"- {p.titulo}: R$ {p.valor}\n"
        total += p.valor

    prompt = f"Analise estes gastos (Total R$ {total}):\n{dados_texto}\nDê 2 dicas rápidas."

    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        return {"analysis": response.text}
    except Exception as e:
        return {"analysis": "Erro na IA."}

# --- CATEGORIAS (DESBLOQUEADA) ---
@app.post("/categories/")
def create_category(name: str = Form(...), type: str = Form(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # REMOVIDO LIMITE DE 5 CATEGORIAS
    nova = Category(name=name, type=type, owner_id=current_user.id)
    db.add(nova); db.commit(); db.refresh(nova)
    return nova

@app.get("/categories/")
def list_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Category).filter(Category.owner_id == current_user.id).all()

@app.delete("/categories/{id}")
def delete_category(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Category).filter(Category.id == id, Category.owner_id == current_user.id).first()
    if item: db.delete(item); db.commit()
    return {"ok": True}

# --- CRUD BÁSICO ---
@app.post("/pagamentos/")
async def criar_pagamento(titulo: str = Form(...), valor: float = Form(...), categoria: str = Form(...), comprovante: UploadFile = File(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    url = None
    if comprovante:
        url = cloudinary.uploader.upload(comprovante.file).get("secure_url")
    novo = Pagamento(titulo=titulo, valor=valor, categoria=categoria, comprovante_path=url, owner_id=current_user.id)
    db.add(novo); db.commit(); db.refresh(novo)
    return novo

@app.get("/pagamentos/")
def listar_pagamentos(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Pagamento).filter(Pagamento.owner_id == current_user.id).all()

@app.delete("/pagamentos/{id}")
def deletar_pagamento(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Pagamento).filter(Pagamento.id == id, Pagamento.owner_id == current_user.id).first()
    if item: db.delete(item); db.commit()
    return {"ok": True}

@app.post("/recebimentos/")
async def criar_recebimento(titulo: str = Form(...), valor: float = Form(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    novo = Recebimento(titulo=titulo, valor=valor, cliente="Cliente", status="Recebido", owner_id=current_user.id)
    db.add(novo); db.commit(); db.refresh(novo)
    return novo

@app.get("/recebimentos/")
def listar_recebimentos(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Recebimento).filter(Recebimento.owner_id == current_user.id).all()

@app.get("/system/reset-db-force")
def reset_database():
    Base.metadata.drop_all(bind=engine) 
    Base.metadata.create_all(bind=engine) 
    return {"message": "Banco Limpo!"}