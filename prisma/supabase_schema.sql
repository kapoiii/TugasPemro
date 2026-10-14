-- ==============================================================================
-- SQL SCHEMA & INITIAL SEED DATA FOR SUPABASE POSTGRESQL
-- Project: SMA Nusantara Bangsa - Sistem Informasi & Monitoring Akademik
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Custom ENUM Types safely
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'GURU', 'SISWA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PPDBStatus" AS ENUM ('PENDING', 'DITERIMA', 'DITOLAK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "StatusAbsensi" AS ENUM ('HADIR', 'IZIN', 'SAKIT', 'ALFA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RaportStatus" AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Tables
-- Table: User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SISWA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Table: Kelas
CREATE TABLE IF NOT EXISTS "Kelas" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "namaKelas" TEXT NOT NULL,
    "tingkat" TEXT NOT NULL,
    "waliKelasId" TEXT,

    CONSTRAINT "Kelas_pkey" PRIMARY KEY ("id")
);

-- Table: SiswaProfile
CREATE TABLE IF NOT EXISTS "SiswaProfile" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "nisn" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "kelasId" TEXT,
    "jenisKelamin" TEXT NOT NULL DEFAULT 'L',
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "alamat" TEXT,
    "namaOrangTua" TEXT,
    "noHp" TEXT,

    CONSTRAINT "SiswaProfile_pkey" PRIMARY KEY ("id")
);

-- Table: GuruProfile
CREATE TABLE IF NOT EXISTS "GuruProfile" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "userId" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "mataPelajaranUtama" TEXT,
    "noHp" TEXT,

    CONSTRAINT "GuruProfile_pkey" PRIMARY KEY ("id")
);

-- Table: MataPelajaran
CREATE TABLE IF NOT EXISTS "MataPelajaran" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "kodeMapel" TEXT NOT NULL,
    "namaMapel" TEXT NOT NULL,
    "kkm" DOUBLE PRECISION NOT NULL DEFAULT 75.0,

    CONSTRAINT "MataPelajaran_pkey" PRIMARY KEY ("id")
);

-- Table: PPDB
CREATE TABLE IF NOT EXISTS "PPDB" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "noPendaftaran" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "nisn" TEXT NOT NULL,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "agama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "namaAyah" TEXT NOT NULL,
    "namaIbu" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "pilihanJurusan" TEXT NOT NULL,
    "berkasIjazahUrl" TEXT,
    "berkasKkUrl" TEXT,
    "berkasAkteUrl" TEXT,
    "status" "PPDBStatus" NOT NULL DEFAULT 'PENDING',
    "catatan" TEXT,
    "verifierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PPDB_pkey" PRIMARY KEY ("id")
);

-- Table: SesiAbsensi
CREATE TABLE IF NOT EXISTS "SesiAbsensi" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "kelasId" TEXT NOT NULL,
    "mapelId" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pertemuanKe" INTEGER NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SesiAbsensi_pkey" PRIMARY KEY ("id")
);

-- Table: DetailAbsensi
CREATE TABLE IF NOT EXISTS "DetailAbsensi" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "sesiAbsensiId" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "status" "StatusAbsensi" NOT NULL DEFAULT 'HADIR',
    "catatan" TEXT,

    CONSTRAINT "DetailAbsensi_pkey" PRIMARY KEY ("id")
);

-- Table: Nilai
CREATE TABLE IF NOT EXISTS "Nilai" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "siswaId" TEXT NOT NULL,
    "mapelId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "tahunAjaran" TEXT NOT NULL,
    "nilaiTugas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nilaiUts" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nilaiUas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nilaiPraktik" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nilaiSikap" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nilaiAkhir" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "predikat" TEXT NOT NULL DEFAULT 'C',
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nilai_pkey" PRIMARY KEY ("id")
);

-- Table: Raport
CREATE TABLE IF NOT EXISTS "Raport" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "siswaId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "tahunAjaran" TEXT NOT NULL,
    "totalHadir" INTEGER NOT NULL DEFAULT 0,
    "totalIzin" INTEGER NOT NULL DEFAULT 0,
    "totalSakit" INTEGER NOT NULL DEFAULT 0,
    "totalAlfa" INTEGER NOT NULL DEFAULT 0,
    "rataRataNilai" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "catatanWaliKelas" TEXT,
    "status" "RaportStatus" NOT NULL DEFAULT 'DRAFT',
    "pdfUrl" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Raport_pkey" PRIMARY KEY ("id")
);

-- Table: AuditLog
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- 4. Create Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Kelas_namaKelas_key" ON "Kelas"("namaKelas");
CREATE UNIQUE INDEX IF NOT EXISTS "Kelas_waliKelasId_key" ON "Kelas"("waliKelasId");
CREATE UNIQUE INDEX IF NOT EXISTS "SiswaProfile_userId_key" ON "SiswaProfile"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "SiswaProfile_nis_key" ON "SiswaProfile"("nis");
CREATE UNIQUE INDEX IF NOT EXISTS "SiswaProfile_nisn_key" ON "SiswaProfile"("nisn");
CREATE UNIQUE INDEX IF NOT EXISTS "GuruProfile_userId_key" ON "GuruProfile"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "GuruProfile_nip_key" ON "GuruProfile"("nip");
CREATE UNIQUE INDEX IF NOT EXISTS "MataPelajaran_kodeMapel_key" ON "MataPelajaran"("kodeMapel");
CREATE UNIQUE INDEX IF NOT EXISTS "PPDB_noPendaftaran_key" ON "PPDB"("noPendaftaran");
CREATE UNIQUE INDEX IF NOT EXISTS "PPDB_nisn_key" ON "PPDB"("nisn");
CREATE UNIQUE INDEX IF NOT EXISTS "DetailAbsensi_sesiAbsensiId_siswaId_key" ON "DetailAbsensi"("sesiAbsensiId", "siswaId");
CREATE UNIQUE INDEX IF NOT EXISTS "Nilai_siswaId_mapelId_semester_tahunAjaran_key" ON "Nilai"("siswaId", "mapelId", "semester", "tahunAjaran");
CREATE UNIQUE INDEX IF NOT EXISTS "Raport_siswaId_semester_tahunAjaran_key" ON "Raport"("siswaId", "semester", "tahunAjaran");

-- 5. Foreign Key Constraints
DO $$ BEGIN
    ALTER TABLE "Kelas" ADD CONSTRAINT "Kelas_waliKelasId_fkey" FOREIGN KEY ("waliKelasId") REFERENCES "GuruProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "SiswaProfile" ADD CONSTRAINT "SiswaProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "SiswaProfile" ADD CONSTRAINT "SiswaProfile_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "GuruProfile" ADD CONSTRAINT "GuruProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "PPDB" ADD CONSTRAINT "PPDB_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "SesiAbsensi" ADD CONSTRAINT "SesiAbsensi_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "SesiAbsensi" ADD CONSTRAINT "SesiAbsensi_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "MataPelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "SesiAbsensi" ADD CONSTRAINT "SesiAbsensi_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "GuruProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "DetailAbsensi" ADD CONSTRAINT "DetailAbsensi_sesiAbsensiId_fkey" FOREIGN KEY ("sesiAbsensiId") REFERENCES "SesiAbsensi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "DetailAbsensi" ADD CONSTRAINT "DetailAbsensi_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "SiswaProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "SiswaProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "MataPelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Nilai" ADD CONSTRAINT "Nilai_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "GuruProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Raport" ADD CONSTRAINT "Raport_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "SiswaProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Raport" ADD CONSTRAINT "Raport_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- 6. DATA AWAL (SEED DATA: ADMIN, GURU, SISWA, KELAS, MAPEL)
-- ==============================================================================

-- A. Kelas Default
INSERT INTO "Kelas" ("id", "namaKelas", "tingkat")
VALUES
    ('kelas-10-mipa1', 'X MIPA 1', '10'),
    ('kelas-11-mipa1', 'XI MIPA 1', '11'),
    ('kelas-12-mipa1', 'XII MIPA 1', '12')
ON CONFLICT ("namaKelas") DO NOTHING;

-- B. Mata Pelajaran Default
INSERT INTO "MataPelajaran" ("id", "kodeMapel", "namaMapel", "kkm")
VALUES
    ('mapel-mtk', 'MTK-10', 'Matematika Wajib', 75.0),
    ('mapel-bin', 'BIN-10', 'Bahasa Indonesia', 75.0),
    ('mapel-ing', 'ING-10', 'Bahasa Inggris', 75.0),
    ('mapel-fis', 'FIS-10', 'Fisika', 75.0),
    ('mapel-kim', 'KIM-10', 'Kimia', 75.0)
ON CONFLICT ("kodeMapel") DO NOTHING;

-- C. Superadmin User: admin / admin123
INSERT INTO "User" ("id", "username", "email", "passwordHash", "role")
VALUES
    ('usr-admin-01', 'admin', 'admin@sekolah.sch.id', '$2b$10$EIjyY5oo5mfHG8LthdujBuYfZhYyYErH04txPpHuhhZLljpIPKmHW', 'ADMIN')
ON CONFLICT ("username") DO UPDATE SET "role" = 'ADMIN';

-- D. Guru User: guru1 / guru123
INSERT INTO "User" ("id", "username", "email", "passwordHash", "role")
VALUES
    ('usr-guru-01', 'guru1', 'budi.santoso@sekolah.sch.id', '$2b$10$8mv3kMieQHw6AHTyLXva1OIMOCvTr2Un/YgJmIoeRlNMe1IgT8/oq', 'GURU')
ON CONFLICT ("username") DO UPDATE SET "role" = 'GURU';

INSERT INTO "GuruProfile" ("id", "userId", "nip", "namaLengkap", "mataPelajaranUtama", "noHp")
VALUES
    ('guru-profile-01', 'usr-guru-01', '198501012010011001', 'Budi Santoso, S.Pd.', 'Matematika', '081234567890')
ON CONFLICT ("nip") DO NOTHING;

-- Update Wali Kelas
UPDATE "Kelas" SET "waliKelasId" = 'guru-profile-01' WHERE "id" = 'kelas-10-mipa1';

-- E. Siswa User: siswa1 / siswa123
INSERT INTO "User" ("id", "username", "email", "passwordHash", "role")
VALUES
    ('usr-siswa-01', 'siswa1', 'ahmad.fauzi@siswa.sch.id', '$2b$10$qm6lvrtA/ge0kdsSCtg9H.B7jxjFCng25Ge5a2KKjc7.qRqItShnW', 'SISWA')
ON CONFLICT ("username") DO UPDATE SET "role" = 'SISWA';

INSERT INTO "SiswaProfile" ("id", "userId", "nis", "nisn", "namaLengkap", "kelasId", "jenisKelamin", "tempatLahir", "tanggalLahir", "alamat", "namaOrangTua", "noHp")
VALUES
    ('siswa-profile-01', 'usr-siswa-01', '1001', '0051234567', 'Ahmad Fauzi', 'kelas-10-mipa1', 'L', 'Jakarta', '2008-05-14', 'Jl. Merdeka No. 45, Jakarta', 'H. Fauzi', '085712345678')
ON CONFLICT ("nisn") DO NOTHING;

-- F. Nilai Awal untuk Siswa Demo
INSERT INTO "Nilai" ("id", "siswaId", "mapelId", "kelasId", "guruId", "semester", "tahunAjaran", "nilaiTugas", "nilaiUts", "nilaiUas", "nilaiPraktik", "nilaiSikap", "nilaiAkhir", "predikat", "catatan")
VALUES
    ('nilai-01', 'siswa-profile-01', 'mapel-mtk', 'kelas-10-mipa1', 'guru-profile-01', '1', '2025/2026', 85, 88, 92, 85, 90, 88.65, 'A', 'Sangat baik dalam pemahaman aljabar'),
    ('nilai-02', 'siswa-profile-01', 'mapel-bin', 'kelas-10-mipa1', 'guru-profile-01', '1', '2025/2026', 90, 90, 92, 90, 95, 91.10, 'A', 'Kemampuan literasi dan menulis esai sangat memuaskan'),
    ('nilai-03', 'siswa-profile-01', 'mapel-ing', 'kelas-10-mipa1', 'guru-profile-01', '1', '2025/2026', 82, 80, 85, 84, 88, 83.30, 'B', 'Pertahankan tata bahasa dan tingkatkan percakapan'),
    ('nilai-04', 'siswa-profile-01', 'mapel-fis', 'kelas-10-mipa1', 'guru-profile-01', '1', '2025/2026', 80, 82, 85, 80, 85, 82.55, 'B', 'Baik dalam penerapan konsep kinematika')
ON CONFLICT ("siswaId", "mapelId", "semester", "tahunAjaran") DO NOTHING;

-- G. Raport Digital Awal
INSERT INTO "Raport" ("id", "siswaId", "kelasId", "semester", "tahunAjaran", "totalHadir", "totalIzin", "totalSakit", "totalAlfa", "rataRataNilai", "catatanWaliKelas", "status")
VALUES
    ('raport-01', 'siswa-profile-01', 'kelas-10-mipa1', '1', '2025/2026', 18, 1, 1, 0, 86.4, 'Pertahankan prestasi belajar dan aktif dalam kegiatan ekstrakurikuler.', 'PUBLISHED')
ON CONFLICT ("siswaId", "semester", "tahunAjaran") DO NOTHING;

-- H. Initial Audit Log
INSERT INTO "AuditLog" ("id", "userId", "action", "detail")
VALUES
    ('log-init-01', 'usr-admin-01', 'INITIAL_DATABASE_SETUP', 'Database Supabase berhasil diinisialisasi dengan tabel skema dan akun demo')
ON CONFLICT DO NOTHING;
