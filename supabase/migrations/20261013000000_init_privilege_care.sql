-- ====================================================================
-- ASSISTENTE PRIVILEGE CARE - FUNDAÇÃO TÉCNICA E BANCO DE DADOS INICIAL
-- PostgreSQL + Supabase Auth + RLS + Auditoria
-- ====================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. PROFILES (users/profiles) vinculada a auth.users
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'partner' CHECK (role IN ('admin', 'partner', 'manager')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------
-- 2. PATIENTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    family_contact TEXT,
    financial_responsible TEXT,
    address TEXT,
    start_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused', 'hospitalized')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------
-- 3. PROFESSIONALS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    pix_key TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------
-- 4. TASKS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    due_time TIME,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category TEXT NOT NULL DEFAULT 'general',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    recurrence TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

-- ---------------------------------------------------------------------
-- 5. SCALES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'replaced')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------
-- 6. SHIFTS (Plantão REALIZADO)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    scheduled_professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type TEXT NOT NULL DEFAULT 'scheduled' CHECK (type IN ('scheduled', 'coverage', 'extra')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'disputed')),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------
-- 7. EXTRAS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'extra_shift',
        'coverage',
        'procedure',
        'additional_service',
        'ambulance',
        'transport',
        'exam',
        'material',
        'other'
    )),
    description TEXT NOT NULL,
    amount_to_receive NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_to_pay NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'billed', 'paid', 'cancelled')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------
-- 8. PAYMENTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
    extra_id UUID REFERENCES public.extras(id) ON DELETE SET NULL,
    shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('receivable', 'payable')),
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'received', 'cancelled')),
    payment_date DATE,
    description TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------
-- 9. CONVERSATIONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'voice')),
    assistant_response TEXT,
    intent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------
-- 10. AUDIT_LOGS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------
-- TRIGGER AUTOMÁTICO PARA UPDATED_AT
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'updated_at'
          AND table_name IN ('profiles', 'patients', 'professionals', 'tasks', 'scales', 'shifts', 'extras', 'payments')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', tbl, tbl);
    LOOP;
END;
$$;

-- ---------------------------------------------------------------------
-- TRIGGER DE NOVO USUÁRIO SUPABASE AUTH -> PUBLIC.PROFILES
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role, active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'partner'),
        true
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, profiles.name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- Todos os dados protegidos: acesso exclusivo a usuários autenticados e ativos.
-- Ambos os sócios compartilham os mesmos dados operacionais da empresa.
-- Nenhum acesso público aos dados.
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: checa se usuário autenticado está ativo
CREATE OR REPLACE FUNCTION public.is_active_member()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND active = true
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas RLS:
-- PROFILES
DROP POLICY IF EXISTS "profiles_select_auth" ON public.profiles;
CREATE POLICY "profiles_select_auth" ON public.profiles
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- Operações da empresa (compartilhadas entre os administradores autenticados)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['patients', 'professionals', 'tasks', 'scales', 'shifts', 'extras', 'payments', 'conversations', 'audit_logs'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I_authenticated_access ON public.%I', t, t);
        EXECUTE format('CREATE POLICY %I_authenticated_access ON public.%I FOR ALL TO authenticated USING (public.is_active_member()) WITH CHECK (public.is_active_member())', t, t);
    END LOOP;
END;
$$;

-- ---------------------------------------------------------------------
-- SUPABASE STORAGE PREPARADO
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "storage_auth_access" ON storage.objects;
CREATE POLICY "storage_auth_access" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'documents' AND public.is_active_member())
    WITH CHECK (bucket_id = 'documents' AND public.is_active_member());
