# Deploy no Google Cloud Run

## Preparação

1. Certifique-se de que o Google Cloud CLI está instalado
2. Configure o projeto: `gcloud config set project YOUR_PROJECT_ID`
3. Configure a autenticação do Docker: `gcloud auth configure-docker`

## Deploy

### Via Docker (Recomendado)

```bash
# Build da imagem
docker build -t gcr.io/YOUR_PROJECT_ID/cilspro:latest .

# Push da imagem
docker push gcr.io/YOUR_PROJECT_ID/cilspro:latest

# Deploy no Cloud Run
gcloud run deploy cilspro \
  --image gcr.io/YOUR_PROJECT_ID/cilspro:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

### Via gcloud direto do código

```bash
gcloud run deploy cilspro \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

## Configuração de Variáveis de Ambiente

Adicione as variáveis necessárias:

```bash
gcloud run services update cilspro \
  --set-env-vars "GOOGLE_CLOUD_PROJECT_ID=YOUR_PROJECT_ID"
```

## Scripts Disponíveis

- `npm run build` - Gera os arquivos de produção
- `npm start` - Inicia o servidor de produção
- `npm run dev` - Modo desenvolvimento (apenas local)