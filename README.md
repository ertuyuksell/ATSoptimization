# ResumeIQ

Yapay zekâ destekli CV analizi ve ATS (Applicant Tracking System) skorlama platformu. Kullanıcının yüklediği bir özgeçmişi otomatik olarak okur, Türkçe ve İngilizce bölümleri tanır, yetenekleri çıkarır, önceden eğitilmiş bir sınıflandırma modeli ile uygun iş rolünü tahmin eder ve sonuçları animasyonlu bir analitik panelinde sunar.

Proje üç bağımsız servisten oluşur: React arayüzü, Spring Boot REST API ve Python FastAPI üzerinde çalışan AI mikroservisi. Tüm bileşenler Docker üzerinde çalışmak üzere yapılandırılmıştır.

---

## İçindekiler

- [Mimari](#mimari)
- [Özellikler](#özellikler)
- [Teknoloji yığını](#teknoloji-yığını)
- [Klasör yapısı](#klasör-yapısı)
- [Başlatma (Docker ile)](#başlatma-docker-ile)
- [Yerel geliştirme ortamı](#yerel-geliştirme-ortamı)
- [Servisler ve port haritası](#servisler-ve-port-haritası)
- [Ortam değişkenleri](#ortam-değişkenleri)
- [API uçları](#api-uçları)
- [Veritabanı şeması](#veritabanı-şeması)
- [Yapay zekâ modeli hakkında](#yapay-zekâ-modeli-hakkında)
- [İşleyiş akışı](#işleyiş-akışı)
- [Sorun giderme](#sorun-giderme)
- [Lisans](#lisans)

---

## Mimari

```
   ┌─────────────────────┐
   │  React Frontend     │  Vite + Tailwind + Framer Motion
   │  (Nginx, port 5174) │
   └──────────┬──────────┘
              │  REST + JWT
              ▼
   ┌─────────────────────┐
   │  Spring Boot API    │  Java 17, JPA, Flyway, Spring Security
   │  (port 8081)        │
   └─────┬──────────┬────┘
         │          │
         │          │  Multipart PDF + iç API anahtarı
         │          ▼
         │   ┌─────────────────────┐
         │   │  FastAPI AI Service │  Python 3.11, scikit-learn,
         │   │  (port 8001)        │  spaCy, Sentence-BERT
         │   │   models/*.pkl      │
         │   └─────────────────────┘
         │
         ▼
   ┌─────────────────────┐
   │  PostgreSQL 16      │  (port 5433)
   └─────────────────────┘
```

Frontend, Spring Boot API'sine kullanıcı kimliğiyle (JWT) konuşur. Spring Boot, gelen PDF dosyasını disk üzerinde saklar ve içerideki paylaşılan API anahtarı ile FastAPI mikroservisine iletir. AI servisi PDF'ten metin çıkarır, NLP işlem hattı ile temizler, yetenekleri ve bölümleri tespit eder, ardından önceden eğitilmiş `.pkl` modeli ile iş rolü tahmini yapar. Sonuç JSON olarak Spring Boot'a döner ve PostgreSQL'de saklanır.

---

## Özellikler

- PDF özgeçmiş yükleme (sürükle-bırak destekli)
- Türkçe ve İngilizce çift dilli bölüm tespiti (Deneyim/Experience, Eğitim/Education, Projeler/Projects, Yetenekler/Skills, Özet/Summary, Sertifikalar, Diller vb.)
- Otomatik yetenek çıkarımı (curated lexicon + spaCy NER)
- 0–100 ölçekli ATS skoru ve alt bileşen kırılımı (uzunluk, bölüm bütünlüğü, yetenek yoğunluğu, format)
- Önceden eğitilmiş model ile iş rolü sınıflandırması ve güven oranı (top-5 aday)
- İş ilanı yapıştırarak semantik benzerlik (Sentence-BERT) ve eksik anahtar kelime analizi
- Mülakatçı simülasyonu: aday hakkında karar ve iyileştirme önerileri
- Animasyonlu analitik paneli, ATS göstergesi, radar grafik, geçmiş listesi
- Tarayıcı içi PDF önizleme
- JWT tabanlı kimlik doğrulama, BCrypt şifre hash'lemesi
- Karanlık ve aydınlık tema desteği
- Kullanıcı bazlı CV geçmişi ve dashboard istatistikleri

---

## Teknoloji yığını

| Katman       | Kullanılan teknolojiler                                                                |
| ------------ | -------------------------------------------------------------------------------------- |
| Arayüz       | React 18, Vite, TailwindCSS, Framer Motion, Recharts, react-pdf, react-dropzone, axios |
| Arka uç      | Spring Boot 3.3 (Java 17), Spring Security, Spring Data JPA, Flyway, WebClient         |
| Yapay zekâ   | FastAPI, joblib, scikit-learn, spaCy, Sentence-Transformers, PyMuPDF, pdfplumber       |
| Veritabanı   | PostgreSQL 16                                                                          |
| Konteyner    | Docker, Docker Compose                                                                 |
| Web sunucusu | Nginx (frontend için)                                                                  |

---

## Klasör yapısı

```
CVProje/
├── frontend/                        React uygulaması
│   ├── src/
│   │   ├── components/              Yeniden kullanılabilir bileşenler
│   │   ├── context/                 Auth ve tema sağlayıcıları
│   │   ├── pages/                   Sayfa bileşenleri
│   │   ├── services/api.js          Axios istemcisi ve uç tanımları
│   │   └── main.jsx
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/                         Spring Boot API
│   ├── src/main/java/com/cvproje/resume/
│   │   ├── config/                  Uygulama ve WebClient yapılandırması
│   │   ├── controller/              REST denetleyicileri
│   │   ├── dto/                     Veri transfer nesneleri
│   │   ├── entity/                  JPA varlıkları
│   │   ├── exception/               Genel hata yönetimi
│   │   ├── repository/              Spring Data depoları
│   │   ├── security/                JWT filtresi ve güvenlik yapılandırması
│   │   └── service/                 İş mantığı katmanı
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/V1__init.sql
│   ├── pom.xml
│   └── Dockerfile
│
├── ai-service/                      FastAPI mikroservisi
│   ├── models/
│   │   └── job_role_classifier.pkl  Önceden eğitilmiş model
│   ├── inference/                   Model yükleyici ve çıkarım servisi
│   ├── preprocessing/               PDF, metin, NLP, yetenek çıkarıcı
│   ├── routers/                     /health ve /api/v1/analyze
│   ├── schemas/                     Pydantic yanıt şemaları
│   ├── utils/                       Yapılandırma, log, güvenlik
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── db/schema.sql                    Bağımsız SQL şeması
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Başlatma (Docker ile)

Önkoşul: Docker Desktop kurulu ve çalışır durumda olmalı.

1. Depoyu klonlayın:

   ```bash
   git clone https://github.com/<kullaniciadi>/CVProje.git
   cd CVProje
   ```

2. Önceden eğitilmiş model dosyasını yerleştirin. `job_role_classifier.pkl` dosyasının `ai-service/models/` klasöründe bulunması gerekir. Boyutu yaklaşık 95 MB olduğu için Git LFS veya release sayfası üzerinden temin edilir.

3. Ortam değişkenlerini hazırlayın:

   ```bash
   cp .env.example .env
   ```

   `.env` dosyasındaki `JWT_SECRET` ve `AI_SERVICE_KEY` değerlerini güçlü rastgele dizilerle güncelleyin.

4. Servisleri başlatın:

   ```bash
   docker compose up -d --build
   ```

   İlk derleme sürüm bağımlılıkları indirildiği için 5–10 dakika sürebilir (özellikle PyTorch ve Sentence-Transformers paketleri). Sonraki başlatmalar saniyeler içinde tamamlanır.

5. Durumu doğrulayın:

   ```bash
   docker compose ps
   curl http://localhost:8001/health
   ```

   Beklenen yanıt: `{"status":"ok","model_loaded":true,"version":"1.0.0"}`

6. Tarayıcıdan **http://localhost:5174** adresine gidin, yeni bir hesap oluşturun ve bir PDF özgeçmiş yükleyin.

Servisleri durdurmak için:

```bash
docker compose down          # konteynerleri durdurur, verileri korur
docker compose down -v       # konteynerleri durdurur ve veritabanını siler
```

---

## Yerel geliştirme ortamı

Docker olmadan her servisi ayrı ayrı çalıştırmak isterseniz:

### PostgreSQL

```bash
docker run -d --name resumeiq-pg -p 5433:5432 \
  -e POSTGRES_DB=resumedb -e POSTGRES_USER=resume -e POSTGRES_PASSWORD=resume \
  postgres:16-alpine
```

### AI servisi

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload --port 8000
```

### Spring Boot arka uç

```bash
cd backend
./mvnw spring-boot:run             # veya: mvn spring-boot:run
```

Çevre değişkenleri ortam üzerinden veya `application.yml` üzerinden ayarlanabilir.

### Frontend

```bash
cd frontend
npm install
npm run dev                        # http://localhost:5173
```

Geliştirme modunda Vite, `/api` yollarını otomatik olarak `localhost:8080`'e yönlendirir.

---

## Servisler ve port haritası

| Servis                | Konteyner adı         | Dış port | İç port | URL                   |
| --------------------- | --------------------- | -------- | ------- | --------------------- |
| Frontend (Nginx)      | resumeiq-frontend-1   | 5174     | 80      | http://localhost:5174 |
| Backend (Spring Boot) | resumeiq-backend-1    | 8081     | 8080    | http://localhost:8081 |
| AI service (FastAPI)  | resumeiq-ai-service-1 | 8001     | 8000    | http://localhost:8001 |
| PostgreSQL            | resumeiq-postgres-1   | 5433     | 5432    | localhost:5433        |

API dokümantasyonu:

- Backend Swagger: http://localhost:8081/swagger-ui/index.html
- AI servisi OpenAPI: http://localhost:8001/docs

---

## Ortam değişkenleri

Kök dizindeki `.env` dosyası `docker-compose` tarafından okunur.

| Değişken               | Açıklama                                                     | Varsayılan                |
| ---------------------- | ------------------------------------------------------------ | ------------------------- |
| `JWT_SECRET`           | JWT imzalama anahtarı (en az 32 bayt)                        | `change-me-very-long-...` |
| `AI_SERVICE_KEY`       | Backend ile AI servisi arasındaki paylaşılan iç API anahtarı | `change-me-internal-key`  |
| `COMPOSE_PROJECT_NAME` | Docker Compose proje adı                                     | `resumeiq`                |

Ek olarak `application.yml` ve `ai-service/.env.example` dosyaları her servisin iç parametrelerini barındırır (veritabanı bağlantı dizesi, model yolu, dosya boyut limiti gibi).

---

## API uçları

### Genel uçlar (kimlik doğrulama gerekmez)

| Yöntem | Yol                  | Açıklama                                     |
| ------ | -------------------- | -------------------------------------------- |
| POST   | `/api/auth/register` | Yeni kullanıcı oluşturur, JWT döner          |
| POST   | `/api/auth/login`    | Var olan kullanıcıyla oturum açar, JWT döner |

### Korunan uçlar (`Authorization: Bearer <token>`)

| Yöntem | Yol                          | Açıklama                                                 |
| ------ | ---------------------------- | -------------------------------------------------------- |
| POST   | `/api/resumes/upload`        | PDF dosyası ve isteğe bağlı iş ilanı ile analiz başlatır |
| GET    | `/api/resumes`               | Kullanıcının tüm CV'lerini listeler                      |
| GET    | `/api/resumes/dashboard`     | Toplam, ortalama skor ve son aktiviteyi döner            |
| GET    | `/api/resumes/{id}/analysis` | İlgili CV için en güncel analizi döner                   |
| GET    | `/api/resumes/{id}/file`     | Yüklenen PDF dosyasını sunar                             |

### AI servisi (yalnızca iç kullanım)

`X-Internal-Api-Key` başlığı ile çağrılır. Yalnızca Spring Boot tarafından kullanılması önerilir.

| Yöntem | Yol               | Açıklama                                                       |
| ------ | ----------------- | -------------------------------------------------------------- |
| GET    | `/health`         | Servis ve model durumu                                         |
| POST   | `/api/v1/analyze` | Multipart PDF ve isteğe bağlı `job_description` ile tam analiz |

### Örnek istek

```bash
TOKEN=$(curl -s -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"sifre123","fullName":"Test User"}' \
  | jq -r .token)

curl -X POST http://localhost:8081/api/resumes/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@cv.pdf" \
  -F "jobDescription=Senior Backend Developer with Spring Boot experience"
```

---

## Veritabanı şeması

Flyway migrasyonu (`backend/src/main/resources/db/migration/V1__init.sql`) ile otomatik oluşturulur.

| Tablo              | Amaç                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| `users`            | Kullanıcı hesapları, BCrypt şifre hash'leri                          |
| `resumes`          | Yüklenen PDF meta verileri, dosya yolu, sahibi                       |
| `resume_analysis`  | Her analiz için skor, tahmin edilen rol, ham JSON yanıt              |
| `extracted_skills` | Analiz başına çıkarılan yetenek listesi                              |
| `ats_scores`       | Alt bileşen skorları (uzunluk, bölüm, yetenek, format, iş eşleşmesi) |
| `job_matches`      | İş ilanı eşleşme detayları, eşleşen ve eksik anahtar kelimeler       |

Bağımsız bir SQL şeması `db/schema.sql` dosyasında bulunur.

---

## Yapay zekâ modeli hakkında

`ai-service/models/job_role_classifier.pkl` dosyası, daha önce ayrı bir veri seti üzerinde eğitilmiş bir scikit-learn modelidir. Bu proje **modeli yeniden eğitmez**; FastAPI ilk açılışta `joblib.load()` ile artefaktı belleğe alır ve sadece `predict` ile `predict_proba` metotlarını kullanır.

Pipeline aşağıdaki adımlardan oluşur:

1. **PDF metin çıkarımı** — PyMuPDF birincil, pdfplumber yedek olarak kullanılır.
2. **Metin temizleme** — Unicode normalizasyonu, madde işareti temizliği, isteğe bağlı PII (e-posta, telefon, URL) maskelemesi.
3. **NLP boru hattı** — spaCy ile token + NER, Sentence-BERT (`all-MiniLM-L6-v2`) ile cümle düzeyinde gömme.
4. **Bölüm tespiti** — Türkçe ve İngilizce başlık sözlüklerine göre kanonik anahtarlara dönüştürme.
5. **Yetenek çıkarımı** — 80+ teknik yetenek içeren özel sözlük + spaCy varlık eşleşmesi.
6. **Model çıkarımı** — Yüklenen `.pkl` üzerinde `predict` ve `predict_proba`; en yüksek 5 aday rol döndürülür.
7. **ATS skoru** — Uzunluk, bölüm bütünlüğü, yetenek yoğunluğu, format ve (varsa) iş ilanı uyumu ağırlıklandırılarak 0–100 arası skora indirgenir.

Eğer modeliniz farklı bir input formatı bekliyorsa (örneğin TF-IDF vektörü gibi), `inference/inference_service.py::predict_job_role` metodunu kendi pipeline'ınıza göre uyarlayabilirsiniz.

---

## İşleyiş akışı

1. Kullanıcı tarayıcıdan kayıt olur veya oturum açar; sunucu JWT döner.
2. Kullanıcı CV PDF'ini sürükler veya seçer, isteğe bağlı bir iş ilanı yapıştırır.
3. Frontend, JWT ile `POST /api/resumes/upload` isteğini gönderir.
4. Spring Boot dosyayı doğrular, diskte saklar ve `resumes` tablosuna kayıt ekler.
5. Spring Boot, multipart isteği iç API anahtarı ile FastAPI'ye iletir.
6. FastAPI metni çıkarır, ön işlemden geçirir, model ve NLP bileşenlerini çalıştırır.
7. JSON yanıt Spring Boot tarafından `resume_analysis`, `extracted_skills`, `ats_scores` ve `job_matches` tablolarına yazılır.
8. Frontend yanıtı analitik paneline çevirir: ATS göstergesi, radar grafiği, yetenek etiketleri, eşleşen ve eksik anahtar kelimeler, mülakatçı simülasyonu, PDF önizlemesi.

---

## Sorun giderme

**Servisler ayağa kalkmıyor.** `docker compose ps` ile durumu kontrol edin. Bir konteyner sürekli yeniden başlıyorsa logları okuyun:

```bash
docker compose logs -f backend
docker compose logs -f ai-service
```

**Port çakışması.** 5174, 8081, 8001 veya 5433 portları başka bir uygulama tarafından kullanılıyor olabilir. `docker-compose.yml` üzerinden farklı bir dış porta yönlendirin.

**`model_loaded: false` yanıtı.** `ai-service/models/job_role_classifier.pkl` dosyasının var olduğundan ve okunabilir olduğundan emin olun.

**Türkçe karakter görünmüyor.** Tarayıcı önbelleğini Ctrl + Shift + R ile sert yenileyin.

**Yüklenen PDF görüntülenmiyor.** Frontend, axios üzerinden PDF'i blob olarak çeker. Kullanıcı oturumunun açık olduğundan ve JWT'nin geçerli olduğundan emin olun.

**ATS skoru beklenenden düşük.** CV'de `Eğitim`, `Deneyim`, `Yetenekler` gibi standart başlıkların açıkça yer aldığından ve metnin metin tabanlı olduğundan emin olun. Resim olarak tarihli PDF'ler düzgün analiz edilemez.

**Maven derleme başarısız.** Java 17 ile derlenir; Java 21 veya 26 kullanıyorsanız Docker üzerinden derleme önerilir.

---
