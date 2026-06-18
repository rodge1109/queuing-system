--
-- PostgreSQL database dump
--


-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

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
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: blocked_dates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blocked_dates (
    id integer NOT NULL,
    blocked_date date NOT NULL,
    reason character varying(255) DEFAULT 'Holiday/Clinic Closed'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: blocked_dates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blocked_dates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blocked_dates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blocked_dates_id_seq OWNED BY public.blocked_dates.id;


--
-- Name: booking_services; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: booking_services_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.booking_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: booking_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.booking_services_id_seq OWNED BY public.booking_services.id;


--
-- Name: booking_specialists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_specialists (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    title character varying(255),
    image_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: booking_specialists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.booking_specialists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: booking_specialists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.booking_specialists_id_seq OWNED BY public.booking_specialists.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: clinic_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clinic_settings (
    key character varying(100) NOT NULL,
    value text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: corporate_accounts; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: corporate_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.corporate_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: corporate_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.corporate_accounts_id_seq OWNED BY public.corporate_accounts.id;


--
-- Name: corporate_invoices; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: corporate_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.corporate_invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: corporate_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.corporate_invoices_id_seq OWNED BY public.corporate_invoices.id;


--
-- Name: corporate_ledgers; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: corporate_ledgers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.corporate_ledgers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: corporate_ledgers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.corporate_ledgers_id_seq OWNED BY public.corporate_ledgers.id;


--
-- Name: corporate_payments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: corporate_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.corporate_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: corporate_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.corporate_payments_id_seq OWNED BY public.corporate_payments.id;


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- Name: folio_items; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: folio_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.folio_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: folio_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.folio_items_id_seq OWNED BY public.folio_items.id;


--
-- Name: folio_payments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: folio_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.folio_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: folio_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.folio_payments_id_seq OWNED BY public.folio_payments.id;


--
-- Name: hotel_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hotel_settings (
    key text NOT NULL,
    value text DEFAULT ''::text NOT NULL
);


--
-- Name: queue_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.queue_settings (
    id integer NOT NULL,
    key character varying(50) NOT NULL,
    value text NOT NULL
);


--
-- Name: queue_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.queue_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: queue_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.queue_settings_id_seq OWNED BY public.queue_settings.id;


--
-- Name: queue_staff; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: queue_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.queue_staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: queue_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.queue_staff_id_seq OWNED BY public.queue_staff.id;


--
-- Name: queue_tellers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.queue_tellers (
    id integer NOT NULL,
    window_name character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: queue_tellers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.queue_tellers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: queue_tellers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.queue_tellers_id_seq OWNED BY public.queue_tellers.id;


--
-- Name: queue_tickets; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: queue_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.queue_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: queue_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.queue_tickets_id_seq OWNED BY public.queue_tickets.id;


--
-- Name: queue_transaction_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.queue_transaction_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    prefix character varying(3) NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: queue_transaction_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.queue_transaction_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: queue_transaction_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.queue_transaction_types_id_seq OWNED BY public.queue_transaction_types.id;


--
-- Name: queue_window_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.queue_window_transactions (
    id integer NOT NULL,
    teller_id integer,
    transaction_type_id integer
);


--
-- Name: queue_window_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.queue_window_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: queue_window_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.queue_window_transactions_id_seq OWNED BY public.queue_window_transactions.id;


--
-- Name: rate_code_prices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_code_prices (
    id integer NOT NULL,
    rate_code_id integer NOT NULL,
    room_type_id integer NOT NULL,
    price_per_night numeric(10,2) NOT NULL
);


--
-- Name: rate_code_prices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rate_code_prices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rate_code_prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rate_code_prices_id_seq OWNED BY public.rate_code_prices.id;


--
-- Name: rate_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_codes (
    id integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: rate_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rate_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rate_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rate_codes_id_seq OWNED BY public.rate_codes.id;


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reservations_id_seq OWNED BY public.reservations.id;


--
-- Name: rider_notifications; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: rider_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rider_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rider_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rider_notifications_id_seq OWNED BY public.rider_notifications.id;


--
-- Name: rider_wallet_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rider_wallet_transactions (
    id integer NOT NULL,
    rider_id integer,
    amount numeric(12,2),
    type character varying(50),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: rider_wallet_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rider_wallet_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rider_wallet_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rider_wallet_transactions_id_seq OWNED BY public.rider_wallet_transactions.id;


--
-- Name: riders; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: riders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.riders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: riders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.riders_id_seq OWNED BY public.riders.id;


--
-- Name: room_types; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: room_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.room_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: room_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.room_types_id_seq OWNED BY public.room_types.id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: staff_messages; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: staff_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.staff_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: staff_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.staff_messages_id_seq OWNED BY public.staff_messages.id;


--
-- Name: staff_pm; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: staff_pm_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.staff_pm_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: staff_pm_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.staff_pm_id_seq OWNED BY public.staff_pm.id;


--
-- Name: survey; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: survey_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.survey_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: survey_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.survey_id_seq OWNED BY public.survey.id;


--
-- Name: trip_incidents; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: trip_incidents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trip_incidents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trip_incidents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trip_incidents_id_seq OWNED BY public.trip_incidents.id;


--
-- Name: trip_messages; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: trip_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trip_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trip_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trip_messages_id_seq OWNED BY public.trip_messages.id;


--
-- Name: trip_timeline; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trip_timeline (
    id integer NOT NULL,
    trip_id integer,
    status character varying(50),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: trip_timeline_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trip_timeline_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trip_timeline_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trip_timeline_id_seq OWNED BY public.trip_timeline.id;


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: blocked_dates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_dates ALTER COLUMN id SET DEFAULT nextval('public.blocked_dates_id_seq'::regclass);


--
-- Name: booking_services id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_services ALTER COLUMN id SET DEFAULT nextval('public.booking_services_id_seq'::regclass);


--
-- Name: booking_specialists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_specialists ALTER COLUMN id SET DEFAULT nextval('public.booking_specialists_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: corporate_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_accounts ALTER COLUMN id SET DEFAULT nextval('public.corporate_accounts_id_seq'::regclass);


--
-- Name: corporate_invoices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_invoices ALTER COLUMN id SET DEFAULT nextval('public.corporate_invoices_id_seq'::regclass);


--
-- Name: corporate_ledgers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_ledgers ALTER COLUMN id SET DEFAULT nextval('public.corporate_ledgers_id_seq'::regclass);


--
-- Name: corporate_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_payments ALTER COLUMN id SET DEFAULT nextval('public.corporate_payments_id_seq'::regclass);


--
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- Name: folio_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_items ALTER COLUMN id SET DEFAULT nextval('public.folio_items_id_seq'::regclass);


--
-- Name: folio_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_payments ALTER COLUMN id SET DEFAULT nextval('public.folio_payments_id_seq'::regclass);


--
-- Name: queue_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_settings ALTER COLUMN id SET DEFAULT nextval('public.queue_settings_id_seq'::regclass);


--
-- Name: queue_staff id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_staff ALTER COLUMN id SET DEFAULT nextval('public.queue_staff_id_seq'::regclass);


--
-- Name: queue_tellers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_tellers ALTER COLUMN id SET DEFAULT nextval('public.queue_tellers_id_seq'::regclass);


--
-- Name: queue_tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_tickets ALTER COLUMN id SET DEFAULT nextval('public.queue_tickets_id_seq'::regclass);


--
-- Name: queue_transaction_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_transaction_types ALTER COLUMN id SET DEFAULT nextval('public.queue_transaction_types_id_seq'::regclass);


--
-- Name: queue_window_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_window_transactions ALTER COLUMN id SET DEFAULT nextval('public.queue_window_transactions_id_seq'::regclass);


--
-- Name: rate_code_prices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_code_prices ALTER COLUMN id SET DEFAULT nextval('public.rate_code_prices_id_seq'::regclass);


--
-- Name: rate_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_codes ALTER COLUMN id SET DEFAULT nextval('public.rate_codes_id_seq'::regclass);


--
-- Name: reservations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations ALTER COLUMN id SET DEFAULT nextval('public.reservations_id_seq'::regclass);


--
-- Name: rider_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rider_notifications ALTER COLUMN id SET DEFAULT nextval('public.rider_notifications_id_seq'::regclass);


--
-- Name: rider_wallet_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rider_wallet_transactions ALTER COLUMN id SET DEFAULT nextval('public.rider_wallet_transactions_id_seq'::regclass);


--
-- Name: riders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.riders ALTER COLUMN id SET DEFAULT nextval('public.riders_id_seq'::regclass);


--
-- Name: room_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_types ALTER COLUMN id SET DEFAULT nextval('public.room_types_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: staff_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_messages ALTER COLUMN id SET DEFAULT nextval('public.staff_messages_id_seq'::regclass);


--
-- Name: staff_pm id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_pm ALTER COLUMN id SET DEFAULT nextval('public.staff_pm_id_seq'::regclass);


--
-- Name: survey id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey ALTER COLUMN id SET DEFAULT nextval('public.survey_id_seq'::regclass);


--
-- Name: trip_incidents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_incidents ALTER COLUMN id SET DEFAULT nextval('public.trip_incidents_id_seq'::regclass);


--
-- Name: trip_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_messages ALTER COLUMN id SET DEFAULT nextval('public.trip_messages_id_seq'::regclass);


--
-- Name: trip_timeline id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_timeline ALTER COLUMN id SET DEFAULT nextval('public.trip_timeline_id_seq'::regclass);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: blocked_dates blocked_dates_blocked_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_dates
    ADD CONSTRAINT blocked_dates_blocked_date_key UNIQUE (blocked_date);


--
-- Name: blocked_dates blocked_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_dates
    ADD CONSTRAINT blocked_dates_pkey PRIMARY KEY (id);


--
-- Name: booking_services booking_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_services
    ADD CONSTRAINT booking_services_pkey PRIMARY KEY (id);


--
-- Name: booking_specialists booking_specialists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_specialists
    ADD CONSTRAINT booking_specialists_pkey PRIMARY KEY (id);


--
-- Name: clients clients_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_phone_number_key UNIQUE (phone_number);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: clinic_settings clinic_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic_settings
    ADD CONSTRAINT clinic_settings_pkey PRIMARY KEY (key);


--
-- Name: corporate_accounts corporate_accounts_account_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_accounts
    ADD CONSTRAINT corporate_accounts_account_number_key UNIQUE (account_number);


--
-- Name: corporate_accounts corporate_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_accounts
    ADD CONSTRAINT corporate_accounts_pkey PRIMARY KEY (id);


--
-- Name: corporate_invoices corporate_invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_invoices
    ADD CONSTRAINT corporate_invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: corporate_invoices corporate_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_invoices
    ADD CONSTRAINT corporate_invoices_pkey PRIMARY KEY (id);


--
-- Name: corporate_ledgers corporate_ledgers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_ledgers
    ADD CONSTRAINT corporate_ledgers_pkey PRIMARY KEY (id);


--
-- Name: corporate_payments corporate_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_payments
    ADD CONSTRAINT corporate_payments_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: folio_items folio_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_items
    ADD CONSTRAINT folio_items_pkey PRIMARY KEY (id);


--
-- Name: folio_payments folio_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folio_payments
    ADD CONSTRAINT folio_payments_pkey PRIMARY KEY (id);


--
-- Name: hotel_settings hotel_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel_settings
    ADD CONSTRAINT hotel_settings_pkey PRIMARY KEY (key);


--
-- Name: queue_settings queue_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_settings
    ADD CONSTRAINT queue_settings_key_key UNIQUE (key);


--
-- Name: queue_settings queue_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_settings
    ADD CONSTRAINT queue_settings_pkey PRIMARY KEY (id);


--
-- Name: queue_staff queue_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_staff
    ADD CONSTRAINT queue_staff_pkey PRIMARY KEY (id);


--
-- Name: queue_staff queue_staff_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_staff
    ADD CONSTRAINT queue_staff_username_key UNIQUE (username);


--
-- Name: queue_tellers queue_tellers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_tellers
    ADD CONSTRAINT queue_tellers_pkey PRIMARY KEY (id);


--
-- Name: queue_tickets queue_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_tickets
    ADD CONSTRAINT queue_tickets_pkey PRIMARY KEY (id);


--
-- Name: queue_transaction_types queue_transaction_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_transaction_types
    ADD CONSTRAINT queue_transaction_types_pkey PRIMARY KEY (id);


--
-- Name: queue_window_transactions queue_window_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_window_transactions
    ADD CONSTRAINT queue_window_transactions_pkey PRIMARY KEY (id);


--
-- Name: queue_window_transactions queue_window_transactions_teller_id_transaction_type_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_window_transactions
    ADD CONSTRAINT queue_window_transactions_teller_id_transaction_type_id_key UNIQUE (teller_id, transaction_type_id);


--
-- Name: rate_code_prices rate_code_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_code_prices
    ADD CONSTRAINT rate_code_prices_pkey PRIMARY KEY (id);


--
-- Name: rate_code_prices rate_code_prices_rate_code_id_room_type_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_code_prices
    ADD CONSTRAINT rate_code_prices_rate_code_id_room_type_id_key UNIQUE (rate_code_id, room_type_id);


--
-- Name: rate_codes rate_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_codes
    ADD CONSTRAINT rate_codes_code_key UNIQUE (code);


--
-- Name: rate_codes rate_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_codes
    ADD CONSTRAINT rate_codes_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: rider_notifications rider_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rider_notifications
    ADD CONSTRAINT rider_notifications_pkey PRIMARY KEY (id);


--
-- Name: rider_wallet_transactions rider_wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rider_wallet_transactions
    ADD CONSTRAINT rider_wallet_transactions_pkey PRIMARY KEY (id);


--
-- Name: riders riders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.riders
    ADD CONSTRAINT riders_pkey PRIMARY KEY (id);


--
-- Name: riders riders_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.riders
    ADD CONSTRAINT riders_username_key UNIQUE (username);


--
-- Name: room_types room_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_types
    ADD CONSTRAINT room_types_name_key UNIQUE (name);


--
-- Name: room_types room_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_types
    ADD CONSTRAINT room_types_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (room_number);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: staff_messages staff_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_messages
    ADD CONSTRAINT staff_messages_pkey PRIMARY KEY (id);


--
-- Name: staff_pm staff_pm_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_pm
    ADD CONSTRAINT staff_pm_pkey PRIMARY KEY (id);


--
-- Name: survey survey_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey
    ADD CONSTRAINT survey_pkey PRIMARY KEY (id);


--
-- Name: trip_incidents trip_incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_incidents
    ADD CONSTRAINT trip_incidents_pkey PRIMARY KEY (id);


--
-- Name: trip_messages trip_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_messages
    ADD CONSTRAINT trip_messages_pkey PRIMARY KEY (id);


--
-- Name: trip_timeline trip_timeline_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_timeline
    ADD CONSTRAINT trip_timeline_pkey PRIMARY KEY (id);


--
-- Name: idx_appointments_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_date ON public.appointments USING btree (preferred_date);


--
-- Name: idx_appointments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);


--
-- Name: idx_appointments_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_token ON public.appointments USING btree (cancel_token);


--
-- Name: idx_appointments_transport_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_transport_status ON public.appointments USING btree (transport_status);


--
-- Name: idx_blocked_dates_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blocked_dates_date ON public.blocked_dates USING btree (blocked_date);


--
-- Name: idx_queue_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_queue_date ON public.queue_tickets USING btree (queue_date);


--
-- Name: idx_queue_tickets_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_queue_tickets_date ON public.queue_tickets USING btree (queue_date);


--
-- Name: idx_queue_tickets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_queue_tickets_status ON public.queue_tickets USING btree (status);


--
-- Name: appointments appointments_corporate_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_corporate_account_id_fkey FOREIGN KEY (corporate_account_id) REFERENCES public.corporate_accounts(id);


--
-- Name: appointments appointments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.corporate_invoices(id);


--
-- Name: appointments appointments_specialist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_specialist_id_fkey FOREIGN KEY (specialist_id) REFERENCES public.booking_specialists(id);


--
-- Name: corporate_invoices corporate_invoices_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_invoices
    ADD CONSTRAINT corporate_invoices_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.corporate_accounts(id) ON DELETE CASCADE;


--
-- Name: corporate_ledgers corporate_ledgers_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_ledgers
    ADD CONSTRAINT corporate_ledgers_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.corporate_accounts(id) ON DELETE CASCADE;


--
-- Name: corporate_payments corporate_payments_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_payments
    ADD CONSTRAINT corporate_payments_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.corporate_accounts(id) ON DELETE CASCADE;


--
-- Name: corporate_payments corporate_payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.corporate_payments
    ADD CONSTRAINT corporate_payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.corporate_invoices(id) ON DELETE SET NULL;


--
-- Name: queue_window_transactions queue_window_transactions_teller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_window_transactions
    ADD CONSTRAINT queue_window_transactions_teller_id_fkey FOREIGN KEY (teller_id) REFERENCES public.queue_tellers(id) ON DELETE CASCADE;


--
-- Name: queue_window_transactions queue_window_transactions_transaction_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_window_transactions
    ADD CONSTRAINT queue_window_transactions_transaction_type_id_fkey FOREIGN KEY (transaction_type_id) REFERENCES public.queue_transaction_types(id) ON DELETE CASCADE;


--
-- Name: rate_code_prices rate_code_prices_rate_code_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_code_prices
    ADD CONSTRAINT rate_code_prices_rate_code_id_fkey FOREIGN KEY (rate_code_id) REFERENCES public.rate_codes(id) ON DELETE CASCADE;


--
-- Name: rate_code_prices rate_code_prices_room_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_code_prices
    ADD CONSTRAINT rate_code_prices_room_type_id_fkey FOREIGN KEY (room_type_id) REFERENCES public.room_types(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


