--
-- PostgreSQL database dump
--

\restrict QadO4Fk6ysaVA3HRClDT5OBFeB98cnyS2tsZsQbgv97ZnMrHpM8V3rAJfCly10U

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-06-15 22:50:59

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16604)
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    full_name character varying(255) NOT NULL,
    phone_number character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    service_type character varying(100) NOT NULL,
    preferred_date date NOT NULL,
    preferred_time character varying(20) NOT NULL,
    notes text,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reminder_sent boolean DEFAULT false,
    cancel_token character varying(100),
    cancellation_reason text,
    doctor_id integer,
    sms_sent boolean DEFAULT false,
    specialist_id integer,
    agent_code character varying(50),
    pickup_location text,
    destination_location text,
    rider_id integer,
    transport_status character varying(50) DEFAULT 'unassigned'::character varying,
    pickup_lat numeric(10,8),
    pickup_lng numeric(11,8),
    dest_lat numeric(10,8),
    dest_lng numeric(11,8),
    total_amount numeric(10,2) DEFAULT 0,
    corporate_account_id integer,
    payment_method text DEFAULT 'cash'::text,
    billing_status character varying(50) DEFAULT 'unbilled'::character varying,
    invoice_id integer
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16603)
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO postgres;

--
-- TOC entry 5402 (class 0 OID 0)
-- Dependencies: 219
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- TOC entry 222 (class 1259 OID 16625)
-- Name: blocked_dates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocked_dates (
    id integer NOT NULL,
    blocked_date date NOT NULL,
    reason character varying(255) DEFAULT 'Holiday/Clinic Closed'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.blocked_dates OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16624)
-- Name: blocked_dates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blocked_dates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blocked_dates_id_seq OWNER TO postgres;

--
-- TOC entry 5403 (class 0 OID 0)
-- Dependencies: 221
-- Name: blocked_dates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blocked_dates_id_seq OWNED BY public.blocked_dates.id;


--
-- TOC entry 263 (class 1259 OID 33799)
-- Name: booking_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_services (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    duration character varying(50),
    price character varying(50),
    icon text,
    category character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    base_fare numeric(10,2) DEFAULT 0,
    per_km_rate numeric(10,2) DEFAULT 0,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true
);


ALTER TABLE public.booking_services OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 33798)
-- Name: booking_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_services_id_seq OWNER TO postgres;

--
-- TOC entry 5404 (class 0 OID 0)
-- Dependencies: 262
-- Name: booking_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_services_id_seq OWNED BY public.booking_services.id;


--
-- TOC entry 261 (class 1259 OID 33787)
-- Name: booking_specialists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_specialists (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    title character varying(255),
    image_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.booking_specialists OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 33786)
-- Name: booking_specialists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_specialists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_specialists_id_seq OWNER TO postgres;

--
-- TOC entry 5405 (class 0 OID 0)
-- Dependencies: 260
-- Name: booking_specialists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_specialists_id_seq OWNED BY public.booking_specialists.id;


--
-- TOC entry 285 (class 1259 OID 58554)
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    full_name character varying(255),
    phone_number character varying(100) NOT NULL,
    email character varying(255),
    address text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 58553)
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_id_seq OWNER TO postgres;

--
-- TOC entry 5406 (class 0 OID 0)
-- Dependencies: 284
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- TOC entry 247 (class 1259 OID 17178)
-- Name: clinic_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinic_settings (
    key character varying(100) NOT NULL,
    value text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.clinic_settings OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 50233)
-- Name: corporate_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.corporate_accounts (
    id integer NOT NULL,
    account_number character varying(50) NOT NULL,
    company_name character varying(255) NOT NULL,
    contact_person character varying(255),
    contact_email character varying(255),
    contact_phone character varying(50),
    credit_limit numeric(10,2) DEFAULT 0.00,
    balance numeric(10,2) DEFAULT 0.00,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.corporate_accounts OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 50232)
-- Name: corporate_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.corporate_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.corporate_accounts_id_seq OWNER TO postgres;

--
-- TOC entry 5407 (class 0 OID 0)
-- Dependencies: 270
-- Name: corporate_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.corporate_accounts_id_seq OWNED BY public.corporate_accounts.id;


--
-- TOC entry 275 (class 1259 OID 50279)
-- Name: corporate_invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.corporate_invoices (
    id integer NOT NULL,
    account_id integer,
    invoice_number character varying(100) NOT NULL,
    period_start date,
    period_end date,
    amount numeric(12,2) DEFAULT 0,
    status character varying(50) DEFAULT 'pending'::character varying,
    date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.corporate_invoices OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 50278)
-- Name: corporate_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.corporate_invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.corporate_invoices_id_seq OWNER TO postgres;

--
-- TOC entry 5408 (class 0 OID 0)
-- Dependencies: 274
-- Name: corporate_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.corporate_invoices_id_seq OWNED BY public.corporate_invoices.id;


--
-- TOC entry 273 (class 1259 OID 50258)
-- Name: corporate_ledgers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.corporate_ledgers (
    id integer NOT NULL,
    account_id integer,
    date date NOT NULL,
    reference character varying(100) NOT NULL,
    description text,
    debit numeric(12,2) DEFAULT 0,
    credit numeric(12,2) DEFAULT 0,
    balance numeric(12,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.corporate_ledgers OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 50257)
-- Name: corporate_ledgers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.corporate_ledgers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.corporate_ledgers_id_seq OWNER TO postgres;

--
-- TOC entry 5409 (class 0 OID 0)
-- Dependencies: 272
-- Name: corporate_ledgers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.corporate_ledgers_id_seq OWNED BY public.corporate_ledgers.id;


--
-- TOC entry 277 (class 1259 OID 50299)
-- Name: corporate_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.corporate_payments (
    id integer NOT NULL,
    account_id integer,
    invoice_id integer,
    amount numeric(12,2) NOT NULL,
    method character varying(100) NOT NULL,
    payment_date date NOT NULL,
    reference_id character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    check_number text,
    bank_name text,
    notes text
);


ALTER TABLE public.corporate_payments OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 50298)
-- Name: corporate_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.corporate_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.corporate_payments_id_seq OWNER TO postgres;

--
-- TOC entry 5410 (class 0 OID 0)
-- Dependencies: 276
-- Name: corporate_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.corporate_payments_id_seq OWNED BY public.corporate_payments.id;


--
-- TOC entry 224 (class 1259 OID 16638)
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    specialization character varying(255) DEFAULT 'General Practice'::character varying,
    color character varying(20) DEFAULT '#3B82F6'::character varying,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16637)
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_id_seq OWNER TO postgres;

--
-- TOC entry 5411 (class 0 OID 0)
-- Dependencies: 223
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- TOC entry 244 (class 1259 OID 17136)
-- Name: folio_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.folio_items (
    id integer NOT NULL,
    reservation_id integer NOT NULL,
    charge_type text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) DEFAULT 0 NOT NULL,
    amount numeric(10,2) NOT NULL,
    posted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    voided boolean DEFAULT false NOT NULL,
    void_reason text DEFAULT ''::text
);


ALTER TABLE public.folio_items OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 17135)
-- Name: folio_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.folio_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.folio_items_id_seq OWNER TO postgres;

--
-- TOC entry 5412 (class 0 OID 0)
-- Dependencies: 243
-- Name: folio_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.folio_items_id_seq OWNED BY public.folio_items.id;


--
-- TOC entry 246 (class 1259 OID 17159)
-- Name: folio_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.folio_payments (
    id integer NOT NULL,
    reservation_id integer NOT NULL,
    payment_method text NOT NULL,
    amount numeric(10,2) NOT NULL,
    reference text DEFAULT ''::text,
    posted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    voided boolean DEFAULT false NOT NULL
);


ALTER TABLE public.folio_payments OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 17158)
-- Name: folio_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.folio_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.folio_payments_id_seq OWNER TO postgres;

--
-- TOC entry 5413 (class 0 OID 0)
-- Dependencies: 245
-- Name: folio_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.folio_payments_id_seq OWNED BY public.folio_payments.id;


--
-- TOC entry 241 (class 1259 OID 17101)
-- Name: hotel_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotel_settings (
    key text NOT NULL,
    value text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.hotel_settings OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16947)
-- Name: queue_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queue_settings (
    id integer NOT NULL,
    key character varying(50) NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.queue_settings OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16946)
-- Name: queue_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.queue_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.queue_settings_id_seq OWNER TO postgres;

--
-- TOC entry 5414 (class 0 OID 0)
-- Dependencies: 233
-- Name: queue_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.queue_settings_id_seq OWNED BY public.queue_settings.id;


--
-- TOC entry 257 (class 1259 OID 33760)
-- Name: queue_staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queue_staff (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    role character varying(20) DEFAULT 'teller'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.queue_staff OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 33759)
-- Name: queue_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.queue_staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.queue_staff_id_seq OWNER TO postgres;

--
-- TOC entry 5415 (class 0 OID 0)
-- Dependencies: 256
-- Name: queue_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.queue_staff_id_seq OWNED BY public.queue_staff.id;


--
-- TOC entry 230 (class 1259 OID 16913)
-- Name: queue_tellers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queue_tellers (
    id integer NOT NULL,
    window_name character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.queue_tellers OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16912)
-- Name: queue_tellers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.queue_tellers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.queue_tellers_id_seq OWNER TO postgres;

--
-- TOC entry 5416 (class 0 OID 0)
-- Dependencies: 229
-- Name: queue_tellers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.queue_tellers_id_seq OWNED BY public.queue_tellers.id;


--
-- TOC entry 232 (class 1259 OID 16924)
-- Name: queue_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queue_tickets (
    id integer NOT NULL,
    ticket_number character varying(20) NOT NULL,
    customer_name character varying(100) NOT NULL,
    cellphone_number character varying(20) NOT NULL,
    transaction_type character varying(100) NOT NULL,
    status character varying(20) DEFAULT 'waiting'::character varying,
    teller_window character varying(50),
    queue_date date DEFAULT CURRENT_DATE,
    created_at timestamp without time zone DEFAULT now(),
    called_at timestamp without time zone,
    completed_at timestamp without time zone,
    is_priority boolean DEFAULT false,
    priority_type character varying(50),
    teller_name character varying(100),
    void_reason text,
    void_note text
);


ALTER TABLE public.queue_tickets OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16923)
-- Name: queue_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.queue_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.queue_tickets_id_seq OWNER TO postgres;

--
-- TOC entry 5417 (class 0 OID 0)
-- Dependencies: 231
-- Name: queue_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.queue_tickets_id_seq OWNED BY public.queue_tickets.id;


--
-- TOC entry 228 (class 1259 OID 16901)
-- Name: queue_transaction_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queue_transaction_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    prefix character varying(3) NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.queue_transaction_types OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16900)
-- Name: queue_transaction_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.queue_transaction_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.queue_transaction_types_id_seq OWNER TO postgres;

--
-- TOC entry 5418 (class 0 OID 0)
-- Dependencies: 227
-- Name: queue_transaction_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.queue_transaction_types_id_seq OWNED BY public.queue_transaction_types.id;


--
-- TOC entry 236 (class 1259 OID 16962)
-- Name: queue_window_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queue_window_transactions (
    id integer NOT NULL,
    teller_id integer,
    transaction_type_id integer
);


ALTER TABLE public.queue_window_transactions OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16961)
-- Name: queue_window_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.queue_window_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.queue_window_transactions_id_seq OWNER TO postgres;

--
-- TOC entry 5419 (class 0 OID 0)
-- Dependencies: 235
-- Name: queue_window_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.queue_window_transactions_id_seq OWNED BY public.queue_window_transactions.id;


--
-- TOC entry 251 (class 1259 OID 17219)
-- Name: rate_code_prices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rate_code_prices (
    id integer NOT NULL,
    rate_code_id integer NOT NULL,
    room_type_id integer NOT NULL,
    price_per_night numeric(10,2) NOT NULL
);


ALTER TABLE public.rate_code_prices OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 17218)
-- Name: rate_code_prices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rate_code_prices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rate_code_prices_id_seq OWNER TO postgres;

--
-- TOC entry 5420 (class 0 OID 0)
-- Dependencies: 250
-- Name: rate_code_prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rate_code_prices_id_seq OWNED BY public.rate_code_prices.id;


--
-- TOC entry 249 (class 1259 OID 17189)
-- Name: rate_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rate_codes (
    id integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rate_codes OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 17187)
-- Name: rate_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rate_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rate_codes_id_seq OWNER TO postgres;

--
-- TOC entry 5421 (class 0 OID 0)
-- Dependencies: 248
-- Name: rate_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rate_codes_id_seq OWNED BY public.rate_codes.id;


--
-- TOC entry 239 (class 1259 OID 17057)
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    id integer NOT NULL,
    full_name text NOT NULL,
    phone_number text NOT NULL,
    email text NOT NULL,
    room_type text NOT NULL,
    check_in_date date NOT NULL,
    check_out_date date NOT NULL,
    number_of_guests integer DEFAULT 1 NOT NULL,
    special_requests text DEFAULT ''::text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    guest_arrived_at timestamp without time zone,
    room_number text,
    checked_in_at timestamp without time zone,
    checked_out_at timestamp without time zone,
    id_verified boolean DEFAULT false,
    payment_collected boolean DEFAULT false,
    front_desk_notes text DEFAULT ''::text,
    title text DEFAULT ''::text,
    middle_name text DEFAULT ''::text,
    gender text DEFAULT ''::text,
    date_of_birth date,
    nationality text DEFAULT ''::text,
    country text DEFAULT ''::text,
    address text DEFAULT ''::text,
    city text DEFAULT ''::text,
    id_type text DEFAULT ''::text,
    id_number text DEFAULT ''::text,
    purpose_of_visit text DEFAULT ''::text,
    eta text DEFAULT ''::text,
    payment_method text DEFAULT ''::text,
    deposit_amount numeric(10,2) DEFAULT 0,
    rate_code text DEFAULT ''::text
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 17055)
-- Name: reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservations_id_seq OWNER TO postgres;

--
-- TOC entry 5422 (class 0 OID 0)
-- Dependencies: 237
-- Name: reservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservations_id_seq OWNED BY public.reservations.id;


--
-- TOC entry 281 (class 1259 OID 50348)
-- Name: rider_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rider_notifications (
    id integer NOT NULL,
    rider_id integer,
    title character varying(255),
    message text,
    type character varying(50) DEFAULT 'system'::character varying,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rider_notifications OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 50347)
-- Name: rider_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rider_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rider_notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5423 (class 0 OID 0)
-- Dependencies: 280
-- Name: rider_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rider_notifications_id_seq OWNED BY public.rider_notifications.id;


--
-- TOC entry 279 (class 1259 OID 50336)
-- Name: rider_wallet_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rider_wallet_transactions (
    id integer NOT NULL,
    rider_id integer,
    amount numeric(12,2),
    type character varying(50),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rider_wallet_transactions OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 50335)
-- Name: rider_wallet_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rider_wallet_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rider_wallet_transactions_id_seq OWNER TO postgres;

--
-- TOC entry 5424 (class 0 OID 0)
-- Dependencies: 278
-- Name: rider_wallet_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rider_wallet_transactions_id_seq OWNED BY public.rider_wallet_transactions.id;


--
-- TOC entry 265 (class 1259 OID 33824)
-- Name: riders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.riders (
    id integer NOT NULL,
    name character varying(100),
    username character varying(50),
    password character varying(100),
    phone character varying(20),
    status character varying(20) DEFAULT 'offline'::character varying,
    current_lat numeric(10,8),
    current_lng numeric(11,8),
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    vehicle_type character varying(50),
    plate_number character varying(20),
    email character varying(100),
    address text,
    brand_model character varying(100),
    balance numeric(12,2) DEFAULT 0.00
);


ALTER TABLE public.riders OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 33823)
-- Name: riders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.riders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.riders_id_seq OWNER TO postgres;

--
-- TOC entry 5425 (class 0 OID 0)
-- Dependencies: 264
-- Name: riders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.riders_id_seq OWNED BY public.riders.id;


--
-- TOC entry 240 (class 1259 OID 17058)
-- Name: room_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_types (
    id integer NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text,
    total_rooms integer DEFAULT 1 NOT NULL,
    price_per_night numeric(10,2) DEFAULT 0 NOT NULL,
    max_guests integer DEFAULT 2 NOT NULL,
    amenities text DEFAULT ''::text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    floor integer DEFAULT 1 NOT NULL,
    area text DEFAULT ''::text
);


ALTER TABLE public.room_types OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 17056)
-- Name: room_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.room_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.room_types_id_seq OWNER TO postgres;

--
-- TOC entry 5426 (class 0 OID 0)
-- Dependencies: 238
-- Name: room_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.room_types_id_seq OWNED BY public.room_types.id;


--
-- TOC entry 242 (class 1259 OID 17114)
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    room_number text NOT NULL,
    room_type text DEFAULT ''::text NOT NULL,
    floor integer DEFAULT 1 NOT NULL,
    hk_status text DEFAULT 'clean'::text NOT NULL,
    notes text DEFAULT ''::text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16654)
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    duration integer DEFAULT 30,
    price numeric(10,2) DEFAULT 0,
    description text,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.services OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16653)
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- TOC entry 5427 (class 0 OID 0)
-- Dependencies: 225
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- TOC entry 253 (class 1259 OID 17243)
-- Name: staff_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_messages (
    id integer NOT NULL,
    sender_name text NOT NULL,
    sender_window text,
    message text,
    created_at timestamp with time zone DEFAULT now(),
    attachment_url text,
    attachment_name text,
    attachment_mime text
);


ALTER TABLE public.staff_messages OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 17242)
-- Name: staff_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_messages_id_seq OWNER TO postgres;

--
-- TOC entry 5428 (class 0 OID 0)
-- Dependencies: 252
-- Name: staff_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_messages_id_seq OWNED BY public.staff_messages.id;


--
-- TOC entry 255 (class 1259 OID 17256)
-- Name: staff_pm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_pm (
    id integer NOT NULL,
    from_name text NOT NULL,
    from_window text,
    to_name text NOT NULL,
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    attachment_url text,
    attachment_name text,
    attachment_mime text
);


ALTER TABLE public.staff_pm OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 17255)
-- Name: staff_pm_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_pm_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_pm_id_seq OWNER TO postgres;

--
-- TOC entry 5429 (class 0 OID 0)
-- Dependencies: 254
-- Name: staff_pm_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_pm_id_seq OWNED BY public.staff_pm.id;


--
-- TOC entry 259 (class 1259 OID 33776)
-- Name: survey; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey (
    id integer NOT NULL,
    name character varying(255),
    age integer,
    sex character varying(10),
    region character varying(100),
    contact_number character varying(50),
    service_availed character varying(200),
    client_type character varying(100),
    cc1 character varying(150),
    cc2 character varying(150),
    cc3 character varying(150),
    cc3_reason text,
    sqd0 integer,
    sqd1 integer,
    sqd2 integer,
    sqd3 integer,
    sqd4 integer,
    sqd5 integer,
    sqd6 integer,
    sqd7 integer,
    sqd8 integer,
    suggestions text,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.survey OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 33775)
-- Name: survey_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.survey_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.survey_id_seq OWNER TO postgres;

--
-- TOC entry 5430 (class 0 OID 0)
-- Dependencies: 258
-- Name: survey_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.survey_id_seq OWNED BY public.survey.id;


--
-- TOC entry 267 (class 1259 OID 42016)
-- Name: trip_incidents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_incidents (
    id integer NOT NULL,
    trip_id integer,
    rider_id integer,
    type character varying(50) DEFAULT 'SOS'::character varying,
    description text,
    lat numeric(10,8),
    lng numeric(11,8),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'pending'::character varying
);


ALTER TABLE public.trip_incidents OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 42015)
-- Name: trip_incidents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trip_incidents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_incidents_id_seq OWNER TO postgres;

--
-- TOC entry 5431 (class 0 OID 0)
-- Dependencies: 266
-- Name: trip_incidents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trip_incidents_id_seq OWNED BY public.trip_incidents.id;


--
-- TOC entry 283 (class 1259 OID 58529)
-- Name: trip_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_messages (
    id integer NOT NULL,
    trip_id integer,
    sender_type character varying(20),
    sender_id integer,
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trip_messages OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 58528)
-- Name: trip_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trip_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_messages_id_seq OWNER TO postgres;

--
-- TOC entry 5432 (class 0 OID 0)
-- Dependencies: 282
-- Name: trip_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trip_messages_id_seq OWNED BY public.trip_messages.id;


--
-- TOC entry 269 (class 1259 OID 42029)
-- Name: trip_timeline; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_timeline (
    id integer NOT NULL,
    trip_id integer,
    status character varying(50),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trip_timeline OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 42028)
-- Name: trip_timeline_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trip_timeline_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_timeline_id_seq OWNER TO postgres;

--
-- TOC entry 5433 (class 0 OID 0)
-- Dependencies: 268
-- Name: trip_timeline_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trip_timeline_id_seq OWNED BY public.trip_timeline.id;


--
-- TOC entry 4988 (class 2604 OID 16607)
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- TOC entry 4998 (class 2604 OID 16628)
-- Name: blocked_dates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_dates ALTER COLUMN id SET DEFAULT nextval('public.blocked_dates_id_seq'::regclass);


--
-- TOC entry 5095 (class 2604 OID 33802)
-- Name: booking_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_services ALTER COLUMN id SET DEFAULT nextval('public.booking_services_id_seq'::regclass);


--
-- TOC entry 5093 (class 2604 OID 33790)
-- Name: booking_specialists id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_specialists ALTER COLUMN id SET DEFAULT nextval('public.booking_specialists_id_seq'::regclass);


--
-- TOC entry 5136 (class 2604 OID 58557)
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- TOC entry 5111 (class 2604 OID 50236)
-- Name: corporate_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corporate_accounts ALTER COLUMN id SET DEFAULT nextval('public.corporate_accounts_id_seq'::regclass);


--
-- TOC entry 5121 (class 2604 OID 50282)
-- Name: corporate_invoices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corporate_invoices ALTER COLUMN id SET DEFAULT nextval('public.corporate_invoices_id_seq'::regclass);


--
-- TOC entry 5116 (class 2604 OID 50261)
-- Name: corporate_ledgers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corporate_ledgers ALTER COLUMN id SET DEFAULT nextval('public.corporate_ledgers_id_seq'::regclass);


--
-- TOC entry 5125 (class 2604 OID 50302)
-- Name: corporate_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corporate_payments ALTER COLUMN id SET DEFAULT nextval('public.corporate_payments_id_seq'::regclass);


--
-- TOC entry 5001 (class 2604 OID 16641)
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- TOC entry 5065 (class 2604 OID 17139)
-- Name: folio_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folio_items ALTER COLUMN id SET DEFAULT nextval('public.folio_items_id_seq'::regclass);


--
-- TOC entry 5072 (class 2604 OID 17162)
-- Name: folio_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folio_payments ALTER COLUMN id SET DEFAULT nextval('public.folio_payments_id_seq'::regclass);


--
-- TOC entry 5024 (class 2604 OID 16950)
-- Name: queue_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_settings ALTER COLUMN id SET DEFAULT nextval('public.queue_settings_id_seq'::regclass);


--
-- TOC entry 5087 (class 2604 OID 33763)
-- Name: queue_staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_staff ALTER COLUMN id SET DEFAULT nextval('public.queue_staff_id_seq'::regclass);


--
-- TOC entry 5016 (class 2604 OID 16916)
-- Name: queue_tellers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_tellers ALTER COLUMN id SET DEFAULT nextval('public.queue_tellers_id_seq'::regclass);


--
-- TOC entry 5019 (class 2604 OID 16927)
-- Name: queue_tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_tickets ALTER COLUMN id SET DEFAULT nextval('public.queue_tickets_id_seq'::regclass);


--
-- TOC entry 5013 (class 2604 OID 16904)
-- Name: queue_transaction_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_transaction_types ALTER COLUMN id SET DEFAULT nextval('public.queue_transaction_types_id_seq'::regclass);


--
-- TOC entry 5025 (class 2604 OID 16965)
-- Name: queue_window_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_window_transactions ALTER COLUMN id SET DEFAULT nextval('public.queue_window_transactions_id_seq'::regclass);


--
-- TOC entry 5081 (class 2604 OID 17222)
-- Name: rate_code_prices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rate_code_prices ALTER COLUMN id SET DEFAULT nextval('public.rate_code_prices_id_seq'::regclass);


--
-- TOC entry 5077 (class 2604 OID 17203)
-- Name: rate_codes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rate_codes ALTER COLUMN id SET DEFAULT nextval('public.rate_codes_id_seq'::regclass);


--
-- TOC entry 5026 (class 2604 OID 17063)
-- Name: reservations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations ALTER COLUMN id SET DEFAULT nextval('public.reservations_id_seq'::regclass);


--
-- TOC entry 5129 (class 2604 OID 50351)
-- Name: rider_notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rider_notifications ALTER COLUMN id SET DEFAULT nextval('public.rider_notifications_id_seq'::regclass);


--
-- TOC entry 5127 (class 2604 OID 50339)
-- Name: rider_wallet_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rider_wallet_transactions ALTER COLUMN id SET DEFAULT nextval('public.rider_wallet_transactions_id_seq'::regclass);


--
-- TOC entry 5101 (class 2604 OID 33827)
-- Name: riders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.riders ALTER COLUMN id SET DEFAULT nextval('public.riders_id_seq'::regclass);


--
-- TOC entry 5048 (class 2604 OID 17064)
-- Name: room_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_types ALTER COLUMN id SET DEFAULT nextval('public.room_types_id_seq'::regclass);


--
-- TOC entry 5007 (class 2604 OID 16657)
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- TOC entry 5082 (class 2604 OID 17246)
-- Name: staff_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_messages ALTER COLUMN id SET DEFAULT nextval('public.staff_messages_id_seq'::regclass);


--
-- TOC entry 5084 (class 2604 OID 17259)
-- Name: staff_pm id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_pm ALTER COLUMN id SET DEFAULT nextval('public.staff_pm_id_seq'::regclass);


--
-- TOC entry 5091 (class 2604 OID 33779)
-- Name: survey id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey ALTER COLUMN id SET DEFAULT nextval('public.survey_id_seq'::regclass);


--
-- TOC entry 5105 (class 2604 OID 42019)
-- Name: trip_incidents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_incidents ALTER COLUMN id SET DEFAULT nextval('public.trip_incidents_id_seq'::regclass);


--
-- TOC entry 5133 (class 2604 OID 58532)
-- Name: trip_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_messages ALTER COLUMN id SET DEFAULT nextval('public.trip_messages_id_seq'::regclass);


--
-- TOC entry 5109 (class 2604 OID 42032)
-- Name: trip_timeline id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_timeline ALTER COLUMN id SET DEFAULT nextval('public.trip_timeline_id_seq'::regclass);


--
-- TOC entry 5140 (class 2606 OID 16621)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 5146 (class 2606 OID 16636)
-- Name: blocked_dates blocked_dates_blocked_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_dates
    ADD CONSTRAINT blocked_dates_blocked_date_key UNIQUE (blocked_date);


--
-- TOC entry 5148 (class 2606 OID 16634)
-- Name: blocked_dates blocked_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_dates
    ADD CONSTRAINT blocked_dates_pkey PRIMARY KEY (id);


--
-- TOC entry 5208 (class 2606 OID 33809)
-- Name: booking_services booking_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_services
    ADD CONSTRAINT booking_services_pkey PRIMARY KEY (id);


--
-- TOC entry 5206 (class 2606 OID 33797)
-- Name: booking_specialists booking_specialists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_specialists
    ADD CONSTRAINT booking_specialists_pkey PRIMARY KEY (id);


--
-- TOC entry 5236 (class 2606 OID 58567)
-- Name: clients clients_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_phone_number_key UNIQUE (phone_number);


--
-- TOC entry 5238 (class 2606 OID 58565)
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- TOC entry 5186 (class 2606 OID 17186)
-- Name: clinic_settings clinic_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinic_settings
    ADD CONSTRAINT clinic_settings_pkey PRIMARY KEY (key);


--
-- TOC entry 5218 (class 2606 OID 50249)
-- Name: corporate_accounts corporate_accounts_account_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corporate_accounts
    ADD CONSTRAINT corporate_accounts_account_number_key UNIQUE (account_number);


--
-- TOC entry 5220 (class 2606 OID 50247)
-- Name: corporate_accounts corporate_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corporate_accounts
    ADD CONSTRAINT corporate_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 5224 (class 2606 OID 50292)
-- Name: corporate_invoices corporate_invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corporate_invoices
    ADD CONSTRAINT corporate_invoices_invoice_number_key UNIQUE (invoice_number);


--
-- TOC entry 5226 (class 2606 OID 50290)
-- Name: corporate_invoices corporate_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corporate_invoices
    ADD CONSTRAINT corporate_invoices_pkey PRIMARY KEY (id);


--
-- TOC entry 5222 (class 2606 OID 50272)
-- Name: corporate_ledgers corporate_ledgers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corporate_ledgers
    ADD CONSTRAINT corporate_ledgers_pkey PRIMARY KEY (id);


--
-- TOC entry 5228 (class 2606 OID 50309)
-- Name: corporate_payments corporate_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corporate_payments
    ADD CONSTRAINT corporate_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5151 (class 2606 OID 16652)
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- TOC entry 5182 (class 2606 OID 17157)
-- Name: folio_items folio_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folio_items
    ADD CONSTRAINT folio_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5184 (class 2606 OID 17174)
-- Name: folio_payments folio_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folio_payments
    ADD CONSTRAINT folio_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5178 (class 2606 OID 17110)
-- Name: hotel_settings hotel_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotel_settings
    ADD CONSTRAINT hotel_settings_pkey PRIMARY KEY (key);


--
-- TOC entry 5164 (class 2606 OID 16959)
-- Name: queue_settings queue_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_settings
    ADD CONSTRAINT queue_settings_key_key UNIQUE (key);


--
-- TOC entry 5166 (class 2606 OID 16957)
-- Name: queue_settings queue_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_settings
    ADD CONSTRAINT queue_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5200 (class 2606 OID 33772)
-- Name: queue_staff queue_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_staff
    ADD CONSTRAINT queue_staff_pkey PRIMARY KEY (id);


--
-- TOC entry 5202 (class 2606 OID 33774)
-- Name: queue_staff queue_staff_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_staff
    ADD CONSTRAINT queue_staff_username_key UNIQUE (username);


--
-- TOC entry 5157 (class 2606 OID 16922)
-- Name: queue_tellers queue_tellers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_tellers
    ADD CONSTRAINT queue_tellers_pkey PRIMARY KEY (id);


--
-- TOC entry 5162 (class 2606 OID 16937)
-- Name: queue_tickets queue_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_tickets
    ADD CONSTRAINT queue_tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 5155 (class 2606 OID 16911)
-- Name: queue_transaction_types queue_transaction_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_transaction_types
    ADD CONSTRAINT queue_transaction_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5168 (class 2606 OID 16968)
-- Name: queue_window_transactions queue_window_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_window_transactions
    ADD CONSTRAINT queue_window_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5170 (class 2606 OID 16970)
-- Name: queue_window_transactions queue_window_transactions_teller_id_transaction_type_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_window_transactions
    ADD CONSTRAINT queue_window_transactions_teller_id_transaction_type_id_key UNIQUE (teller_id, transaction_type_id);


--
-- TOC entry 5192 (class 2606 OID 17228)
-- Name: rate_code_prices rate_code_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rate_code_prices
    ADD CONSTRAINT rate_code_prices_pkey PRIMARY KEY (id);


--
-- TOC entry 5194 (class 2606 OID 17230)
-- Name: rate_code_prices rate_code_prices_rate_code_id_room_type_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rate_code_prices
    ADD CONSTRAINT rate_code_prices_rate_code_id_room_type_id_key UNIQUE (rate_code_id, room_type_id);


--
-- TOC entry 5188 (class 2606 OID 17217)
-- Name: rate_codes rate_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rate_codes
    ADD CONSTRAINT rate_codes_code_key UNIQUE (code);


--
-- TOC entry 5190 (class 2606 OID 17215)
-- Name: rate_codes rate_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rate_codes
    ADD CONSTRAINT rate_codes_pkey PRIMARY KEY (id);


--
-- TOC entry 5172 (class 2606 OID 17098)
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- TOC entry 5232 (class 2606 OID 50359)
-- Name: rider_notifications rider_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rider_notifications
    ADD CONSTRAINT rider_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5230 (class 2606 OID 50345)
-- Name: rider_wallet_transactions rider_wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rider_wallet_transactions
    ADD CONSTRAINT rider_wallet_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5210 (class 2606 OID 33832)
-- Name: riders riders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.riders
    ADD CONSTRAINT riders_pkey PRIMARY KEY (id);


--
-- TOC entry 5212 (class 2606 OID 33834)
-- Name: riders riders_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.riders
    ADD CONSTRAINT riders_username_key UNIQUE (username);


--
-- TOC entry 5174 (class 2606 OID 17100)
-- Name: room_types room_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_types
    ADD CONSTRAINT room_types_name_key UNIQUE (name);


--
-- TOC entry 5176 (class 2606 OID 17096)
-- Name: room_types room_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_types
    ADD CONSTRAINT room_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5180 (class 2606 OID 17131)
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_number);


--
-- TOC entry 5153 (class 2606 OID 16668)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- TOC entry 5196 (class 2606 OID 17254)
-- Name: staff_messages staff_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_messages
    ADD CONSTRAINT staff_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5198 (class 2606 OID 17269)
-- Name: staff_pm staff_pm_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_pm
    ADD CONSTRAINT staff_pm_pkey PRIMARY KEY (id);


--
-- TOC entry 5204 (class 2606 OID 33785)
-- Name: survey survey_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey
    ADD CONSTRAINT survey_pkey PRIMARY KEY (id);


--
-- TOC entry 5214 (class 2606 OID 42027)
-- Name: trip_incidents trip_incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_incidents
    ADD CONSTRAINT trip_incidents_pkey PRIMARY KEY (id);


--
-- TOC entry 5234 (class 2606 OID 58539)
-- Name: trip_messages trip_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_messages
    ADD CONSTRAINT trip_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5216 (class 2606 OID 42036)
-- Name: trip_timeline trip_timeline_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_timeline
    ADD CONSTRAINT trip_timeline_pkey PRIMARY KEY (id);


--
-- TOC entry 5141 (class 1259 OID 16670)
-- Name: idx_appointments_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_date ON public.appointments USING btree (preferred_date);


--
-- TOC entry 5142 (class 1259 OID 16671)
-- Name: idx_appointments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);


--
-- TOC entry 5143 (class 1259 OID 42040)
-- Name: idx_appointments_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_token ON public.appointments USING btree (cancel_token);


--
-- TOC entry 5144 (class 1259 OID 42041)
-- Name: idx_appointments_transport_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_transport_status ON public.appointments USING btree (transport_status);


--
-- TOC entry 5149 (class 1259 OID 16669)
-- Name: idx_blocked_dates_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blocked_dates_date ON public.blocked_dates USING btree (blocked_date);


--
-- TOC entry 5158 (class 1259 OID 33836)
-- Name: idx_queue_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_queue_date ON public.queue_tickets USING btree (queue_date);


--
-- TOC entry 5159 (class 1259 OID 16938)
-- Name: idx_queue_tickets_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_queue_tickets_date ON public.queue_tickets USING btree (queue_date);


--
-- TOC entry 5160 (class 1259 OID 16939)
-- Name: idx_queue_tickets_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_queue_tickets_status ON public.queue_tickets USING btree (status);


--
-- TOC entry 5239 (class 2606 OID 50251)
-- Name: appointments appointments_corporate_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_corporate_account_id_fkey FOREIGN KEY (corporate_account_id) REFERENCES public.corporate_accounts(id);


--
-- TOC entry 5240 (class 2606 OID 50323)
-- Name: appointments appointments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.corporate_invoices(id);


--
-- TOC entry 5241 (class 2606 OID 33810)
-- Name: appointments appointments_specialist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_specialist_id_fkey FOREIGN KEY (specialist_id) REFERENCES public.booking_specialists(id);


--
-- TOC entry 5247 (class 2606 OID 50293)
-- Name: corporate_invoices corporate_invoices_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corporate_invoices
    ADD CONSTRAINT corporate_invoices_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.corporate_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 5246 (class 2606 OID 50273)
-- Name: corporate_ledgers corporate_ledgers_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corporate_ledgers
    ADD CONSTRAINT corporate_ledgers_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.corporate_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 5248 (class 2606 OID 50310)
-- Name: corporate_payments corporate_payments_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corporate_payments
    ADD CONSTRAINT corporate_payments_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.corporate_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 5249 (class 2606 OID 50315)
-- Name: corporate_payments corporate_payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corporate_payments
    ADD CONSTRAINT corporate_payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.corporate_invoices(id) ON DELETE SET NULL;


--
-- TOC entry 5242 (class 2606 OID 16971)
-- Name: queue_window_transactions queue_window_transactions_teller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_window_transactions
    ADD CONSTRAINT queue_window_transactions_teller_id_fkey FOREIGN KEY (teller_id) REFERENCES public.queue_tellers(id) ON DELETE CASCADE;


--
-- TOC entry 5243 (class 2606 OID 16976)
-- Name: queue_window_transactions queue_window_transactions_transaction_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue_window_transactions
    ADD CONSTRAINT queue_window_transactions_transaction_type_id_fkey FOREIGN KEY (transaction_type_id) REFERENCES public.queue_transaction_types(id) ON DELETE CASCADE;


--
-- TOC entry 5244 (class 2606 OID 17231)
-- Name: rate_code_prices rate_code_prices_rate_code_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rate_code_prices
    ADD CONSTRAINT rate_code_prices_rate_code_id_fkey FOREIGN KEY (rate_code_id) REFERENCES public.rate_codes(id) ON DELETE CASCADE;


--
-- TOC entry 5245 (class 2606 OID 17236)
-- Name: rate_code_prices rate_code_prices_room_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rate_code_prices
    ADD CONSTRAINT rate_code_prices_room_type_id_fkey FOREIGN KEY (room_type_id) REFERENCES public.room_types(id) ON DELETE CASCADE;


-- Completed on 2026-06-15 22:50:59

--
-- PostgreSQL database dump complete
--

\unrestrict QadO4Fk6ysaVA3HRClDT5OBFeB98cnyS2tsZsQbgv97ZnMrHpM8V3rAJfCly10U

