-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    number VARCHAR(20),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar sequence para o endereço
CREATE SEQUENCE IF NOT EXISTS public.address_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- Tabela de Endereços
CREATE TABLE IF NOT EXISTS public.address
(
    id integer NOT NULL DEFAULT nextval('address_id_seq'::regclass),
    recipient_name character varying(100) NOT NULL,
    street character varying(150) NOT NULL,
    "number" integer NOT NULL,
    complement character varying(100),
    neighborhood character varying(100) NOT NULL,
    city character varying(100) NOT NULL,
    state character(2) NOT NULL,
    postal_code character varying(10) NOT NULL,
    country character varying(50) DEFAULT 'Brasil',
    user_id integer NOT NULL,
    CONSTRAINT address_pkey PRIMARY KEY (id),
    CONSTRAINT fk_user FOREIGN KEY (user_id)
        REFERENCES public.users (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
