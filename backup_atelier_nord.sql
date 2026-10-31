--
-- PostgreSQL database dump
--

\restrict xd3MUeEtXBDnMYVdzOfvbcZqVg8pyZ1gjHetSf3ChFkzChJUIUhqWom5qr9ZJud

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- Name: MovementType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MovementType" AS ENUM (
    'IN',
    'OUT',
    'ADJUST'
);


ALTER TYPE public."MovementType" OWNER TO postgres;

--
-- Name: OrderSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderSource" AS ENUM (
    'WEB',
    'COUNTER'
);


ALTER TYPE public."OrderSource" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'VENTE',
    'STOCK'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedById" text
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    number integer NOT NULL,
    "customerName" text NOT NULL,
    "customerEmail" text,
    "customerPhone" text,
    source public."OrderSource" DEFAULT 'WEB'::public."OrderSource" NOT NULL,
    total double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    title text NOT NULL,
    "unitPrice" double precision NOT NULL,
    quantity integer NOT NULL,
    "orderId" text NOT NULL,
    "productId" text
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: Order_number_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Order_number_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Order_number_seq" OWNER TO postgres;

--
-- Name: Order_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Order_number_seq" OWNED BY public."Order".number;


--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    "imageUrl" text NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    stock integer DEFAULT 10 NOT NULL,
    "categoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: StockMovement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StockMovement" (
    id text NOT NULL,
    type public."MovementType" NOT NULL,
    quantity integer NOT NULL,
    "stockAfter" integer NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "productId" text NOT NULL,
    "userId" text,
    "orderId" text
);


ALTER TABLE public."StockMovement" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'VENTE'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "photoUrl" text,
    gender public."Gender" DEFAULT 'MALE'::public."Gender" NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: Order number; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order" ALTER COLUMN number SET DEFAULT nextval('public."Order_number_seq"'::regclass);


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, "createdAt", "createdById", "updatedAt", "updatedById") FROM stdin;
cmvuwmn9x0001qq98yk1nnmiq	Maison	2026-10-31 09:29:24.212	\N	2026-10-31 09:29:24.212	\N
cmvuwmnam000bqq98a2ixulyt	Cuisine	2026-10-31 09:29:24.212	\N	2026-10-31 09:29:24.212	\N
cmvuwmnaz000lqq98gv8vnbpv	Textile	2026-10-31 09:29:24.212	\N	2026-10-31 09:29:24.212	\N
cmvuwmnb8000vqq98e86teg1u	Bureau	2026-10-31 09:29:24.212	\N	2026-10-31 09:29:24.212	\N
cmvvyw20t0015qqj40nh9w66g	Jardin	2026-10-31 09:29:24.212	\N	2026-10-31 09:29:24.212	\N
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, number, "customerName", "customerEmail", "customerPhone", source, total, "createdAt", "createdById") FROM stdin;
cmvw8utj50001qqpw7m5z7lsk	8	Ranaivo	\N	0341040234	COUNTER	129	2026-10-31 10:14:15.041	cmvvw379i0000qqmggf4i5160
cmvw8vv0e000cqqpweabyzurv	9	Rakoto	\N	0341040234	COUNTER	454	2026-10-31 10:15:03.614	cmvvw379i0000qqmggf4i5160
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, title, "unitPrice", quantity, "orderId", "productId") FROM stdin;
cmvw8utj50003qqpwugjn90xs	Cafetière à piston 800 ml	38	1	cmvw8utj50001qqpw7m5z7lsk	cmvw8f85f0014qq6ofshr33lq
cmvw8utj50004qqpw6egvw5tv	Housse de coussin en lin	34	1	cmvw8utj50001qqpw7m5z7lsk	cmvw8f85q001fqq6ozbam5ryu
cmvw8utj50005qqpwqsnh4jmi	Arrosoir en zinc 5L	38	1	cmvw8utj50001qqpw7m5z7lsk	cmvw8f86t002jqq6owt252hhn
cmvw8utj50006qqpw90oa2mgu	Gants de jardinage en cuir	19	1	cmvw8utj50001qqpw7m5z7lsk	cmvw8f86w002mqq6omt3ds940
cmvw8vv0e000eqqpw02ma3kfj	Bougie cire de colza	26	5	cmvw8vv0e000cqqpweabyzurv	cmvw8f84j000bqq6ouq7n5fb9
cmvw8vv0e000fqqpw01lcriiw	Horloge murale minimale	65	2	cmvw8vv0e000cqqpweabyzurv	cmvw8f84q000hqq6oohp950ry
cmvw8vv0e000gqqpwqs280wu0	Couteau de chef 20 cm	89	2	cmvw8vv0e000cqqpweabyzurv	cmvw8f859000yqq6o5wwhewnd
cmvw8vv0e000hqqpw57es7ana	Transplanteur gradué	16	1	cmvw8vv0e000cqqpweabyzurv	cmvw8f86z002pqq6o3wtrxmwz
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, title, description, price, "imageUrl", "isFeatured", stock, "categoryId", "createdAt") FROM stdin;
cmvw8f856000vqq6oln986o9i	Set de 4 bols en céramique	Compatibles lave-vaisselle et micro-ondes.	64	/products/bowls.svg	f	10	cmvuwmnam000bqq98a2ixulyt	2026-10-31 10:02:07.483
cmvw8f85c0011qq6orlrvpy5c	Moulin à poivre en font	Mécanisme en acier moulé, réglage de la mouture.	45	/products/grinder.svg	f	10	cmvuwmnam000bqq98a2ixulyt	2026-10-31 10:02:07.489
cmvw8f85i0017qq6ocd8778oo	Boîtes hermétiques inox (lot de 3)	Couvercles en silicone alimentaire sans BPA.	49	/products/containers.svg	f	10	cmvuwmnam000bqq98a2ixulyt	2026-10-31 10:02:07.495
cmvw8f85o001cqq6oaygxqgbz	Plaid en laine mérinos	Tissé en Europe, 130 × 180 cm, coloris brume.	115	/products/blanket.svg	t	10	cmvuwmnaz000lqq98gv8vnbpv	2026-10-31 10:02:07.5
cmvw8f85t001iqq6obdxmgjfb	Torchons en coton (lot de 3)	Coton bio, tissage nid d'abeille.	22	/products/towels.svg	f	10	cmvuwmnaz000lqq98gv8vnbpv	2026-10-31 10:02:07.506
cmvw8f85w001lqq6o1v3et7q1	Nappe en lin lavé	Finition surpiquée, 150 × 250 cm, coloris terracotta.	85	/products/tablecloth.svg	f	10	cmvuwmnaz000lqq98gv8vnbpv	2026-10-31 10:02:07.508
cmvw8f85z001oqq6ouydrd0xk	Tapis de bain gaufré	100% coton très absorbant, 50 × 80 cm.	28	/products/mat.svg	f	10	cmvuwmnaz000lqq98gv8vnbpv	2026-10-31 10:02:07.511
cmvw8f861001rqq6omxiprwq5	Drap de lit en chanvre	Thermorégulateur et respirant, 240 × 260 cm.	145	/products/bedsheet.svg	f	10	cmvuwmnaz000lqq98gv8vnbpv	2026-10-31 10:02:07.514
cmvw8f867001wqq6ovzanu2ym	Lampe de bureau articulée	Métal laqué, ampoule LED incluse, câble textile.	79	/products/lamp.svg	t	10	cmvuwmnb8000vqq98e86teg1u	2026-10-31 10:02:07.519
cmvw8f8450008qq6oat489zfj	Vase en grès fumé	Tourné à la main, émail mat gris fumée. Hauteur 24 cm.	48	/products/vase.svg	t	10	cmvuwmn9x0001qq98yk1nnmiq	2026-10-31 10:02:07.445
cmvw8f84m000eqq6odc4ciu9z	Miroir rond en chêne	Cadre en chêne massif huilé, diamètre 60 cm.	129	/products/mirror.svg	f	10	cmvuwmn9x0001qq98yk1nnmiq	2026-10-31 10:02:07.463
cmvw8f84t000kqq6ofbwp84t2	Coussin de sol en velours	Rembourrage coton, toucher doux, diamètre 50 cm.	42	/products/floor-cushion.svg	f	10	cmvuwmn9x0001qq98yk1nnmiq	2026-10-31 10:02:07.47
cmvw8f84x000nqq6oqa9edxyy	Cache-pot en terre cuite	Argile naturelle striée à la main, drainant.	32	/products/pot.svg	f	10	cmvuwmn9x0001qq98yk1nnmiq	2026-10-31 10:02:07.473
cmvw8f853000sqq6oqqwrfq8n	Planche à découper noyer	Noyer français, finition huile alimentaire. 40 × 25 cm.	59	/products/board.svg	t	10	cmvuwmnam000bqq98a2ixulyt	2026-10-31 10:02:07.48
cmvw8f86a001zqq6o9e5azlat	Carnet cousu main A5	Papier 120 g, 192 pages, couverture en toile.	18	/products/notebook.svg	f	10	cmvuwmnb8000vqq98e86teg1u	2026-10-31 10:02:07.522
cmvw8f86c0022qq6olr9uaf6b	Range-câbles en liège	Organise jusqu'à six câbles, fixation adhésive.	15	/products/cork.svg	f	10	cmvuwmnb8000vqq98e86teg1u	2026-10-31 10:02:07.525
cmvw8f86f0025qq6obpynxohc	Pot à crayons en céramique	Design épuré, base antidérapante en liège.	21	/products/pen-holder.svg	f	10	cmvuwmnb8000vqq98e86teg1u	2026-10-31 10:02:07.528
cmvw8f86i0028qq6of8jq9c8y	Support d'ordinateur en bois	Ergonomique, contreplaqué de bouleau surélevé.	49	/products/laptop-stand.svg	f	10	cmvuwmnb8000vqq98e86teg1u	2026-10-31 10:02:07.53
cmvw8f86l002bqq6ohq5v5qmd	Sous-main en cuir végétal	Surface lisse et confortable, 80 × 40 cm.	39	/products/desk-pad.svg	f	10	cmvuwmnb8000vqq98e86teg1u	2026-10-31 10:02:07.533
cmvw8f86q002gqq6onxk8kee3	Sécateur d'ergonomie en acier	Lames en acier carboné, poignée antidérapante.	29	/products/secateur.svg	t	10	cmvvyw20t0015qqj40nh9w66g	2026-10-31 10:02:07.539
cmvw8f872002sqq6o9zxl54g2	Nichoir à oiseaux en bois	Conçu pour petits oiseaux, toit en zinc étanche.	34	/products/birdhouse.svg	f	10	cmvvyw20t0015qqj40nh9w66g	2026-10-31 10:02:07.551
cmvw8f876002vqq6oohpn0bgs	Lanterne solaire d'extérieur	Structure métal ajouré, allumage automatique.	45	/products/lantern.svg	f	10	cmvvyw20t0015qqj40nh9w66g	2026-10-31 10:02:07.554
cmvw8f85f0014qq6ofshr33lq	Cafetière à piston 800 ml	Verre borosilicate résistant, armature inox.	38	/products/press.svg	f	9	cmvuwmnam000bqq98a2ixulyt	2026-10-31 10:02:07.492
cmvw8f85q001fqq6ozbam5ryu	Housse de coussin en lin	Lin lavé, fermeture cachée, 45 × 45 cm.	34	/products/cushion.svg	f	9	cmvuwmnaz000lqq98gv8vnbpv	2026-10-31 10:02:07.503
cmvw8f86t002jqq6owt252hhn	Arrosoir en zinc 5L	Finition brossée, pomme d'arrosage amovible.	38	/products/wateringcan.svg	f	9	cmvvyw20t0015qqj40nh9w66g	2026-10-31 10:02:07.542
cmvw8f86w002mqq6omt3ds940	Gants de jardinage en cuir	Protection renforcée, cuir souple et respirant.	19	/products/gloves.svg	f	9	cmvvyw20t0015qqj40nh9w66g	2026-10-31 10:02:07.545
cmvw8f84j000bqq6ouq7n5fb9	Bougie cire de colza	Parfum bois de cèdre et figuier, 40 h de combustion.	26	/products/candle.svg	f	5	cmvuwmn9x0001qq98yk1nnmiq	2026-10-31 10:02:07.459
cmvw8f84q000hqq6oohp950ry	Horloge murale minimale	Cadran en béton lissé, aiguilles en laiton silencieuses.	65	/products/clock.svg	f	8	cmvuwmn9x0001qq98yk1nnmiq	2026-10-31 10:02:07.466
cmvw8f859000yqq6o5wwhewnd	Couteau de chef 20 cm	Acier inoxydable, manche en bois de hêtre.	89	/products/knife.svg	t	8	cmvuwmnam000bqq98a2ixulyt	2026-10-31 10:02:07.486
cmvw8f86z002pqq6o3wtrxmwz	Transplanteur gradué	Inox robuste avec manche en frêne certifié FSC.	16	/products/trowel.svg	f	9	cmvvyw20t0015qqj40nh9w66g	2026-10-31 10:02:07.548
\.


--
-- Data for Name: StockMovement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StockMovement" (id, type, quantity, "stockAfter", note, "createdAt", "productId", "userId", "orderId") FROM stdin;
cmvw8utje0007qqpwl9dc4dyy	OUT	-1	9	Vente n°8	2026-10-31 10:14:15.05	cmvw8f85f0014qq6ofshr33lq	cmvvw379i0000qqmggf4i5160	cmvw8utj50001qqpw7m5z7lsk
cmvw8utje0008qqpws5r4v9vq	OUT	-1	9	Vente n°8	2026-10-31 10:14:15.05	cmvw8f85q001fqq6ozbam5ryu	cmvvw379i0000qqmggf4i5160	cmvw8utj50001qqpw7m5z7lsk
cmvw8utje0009qqpw6eh1atro	OUT	-1	9	Vente n°8	2026-10-31 10:14:15.05	cmvw8f86t002jqq6owt252hhn	cmvvw379i0000qqmggf4i5160	cmvw8utj50001qqpw7m5z7lsk
cmvw8utje000aqqpwry4d9v88	OUT	-1	9	Vente n°8	2026-10-31 10:14:15.05	cmvw8f86w002mqq6omt3ds940	cmvvw379i0000qqmggf4i5160	cmvw8utj50001qqpw7m5z7lsk
cmvw8vv0u000iqqpwon3qkr9i	OUT	-5	5	Vente n°9	2026-10-31 10:15:03.631	cmvw8f84j000bqq6ouq7n5fb9	cmvvw379i0000qqmggf4i5160	cmvw8vv0e000cqqpweabyzurv
cmvw8vv0u000jqqpw1ox3g4de	OUT	-2	8	Vente n°9	2026-10-31 10:15:03.631	cmvw8f84q000hqq6oohp950ry	cmvvw379i0000qqmggf4i5160	cmvw8vv0e000cqqpweabyzurv
cmvw8vv0u000kqqpwzqaugcv6	OUT	-2	8	Vente n°9	2026-10-31 10:15:03.631	cmvw8f859000yqq6o5wwhewnd	cmvvw379i0000qqmggf4i5160	cmvw8vv0e000cqqpweabyzurv
cmvw8vv0u000lqqpw4i3vlqdx	OUT	-1	9	Vente n°9	2026-10-31 10:15:03.631	cmvw8f86z002pqq6o3wtrxmwz	cmvvw379i0000qqmggf4i5160	cmvw8vv0e000cqqpweabyzurv
cmvw8f8450009qq6odeabjyia	IN	10	10	Stock initial	2026-10-31 10:02:07.445	cmvw8f8450008qq6oat489zfj	\N	\N
cmvw8f84j000cqq6o984c2zcp	IN	10	10	Stock initial	2026-10-31 10:02:07.459	cmvw8f84j000bqq6ouq7n5fb9	\N	\N
cmvw8f84m000fqq6o0p2urnbg	IN	10	10	Stock initial	2026-10-31 10:02:07.463	cmvw8f84m000eqq6odc4ciu9z	\N	\N
cmvw8f84q000iqq6owg0ux8rh	IN	10	10	Stock initial	2026-10-31 10:02:07.466	cmvw8f84q000hqq6oohp950ry	\N	\N
cmvw8f84t000lqq6opbpicemq	IN	10	10	Stock initial	2026-10-31 10:02:07.47	cmvw8f84t000kqq6ofbwp84t2	\N	\N
cmvw8f84x000oqq6oc4uuu22z	IN	10	10	Stock initial	2026-10-31 10:02:07.473	cmvw8f84x000nqq6oqa9edxyy	\N	\N
cmvw8f853000tqq6omv01xrdn	IN	10	10	Stock initial	2026-10-31 10:02:07.48	cmvw8f853000sqq6oqqwrfq8n	\N	\N
cmvw8f857000wqq6opczsqvqe	IN	10	10	Stock initial	2026-10-31 10:02:07.483	cmvw8f856000vqq6oln986o9i	\N	\N
cmvw8f85a000zqq6obdl3lhhw	IN	10	10	Stock initial	2026-10-31 10:02:07.486	cmvw8f859000yqq6o5wwhewnd	\N	\N
cmvw8f85c0012qq6o6ujdud4q	IN	10	10	Stock initial	2026-10-31 10:02:07.489	cmvw8f85c0011qq6orlrvpy5c	\N	\N
cmvw8f85f0015qq6odfqelu14	IN	10	10	Stock initial	2026-10-31 10:02:07.492	cmvw8f85f0014qq6ofshr33lq	\N	\N
cmvw8f85i0018qq6oukklouti	IN	10	10	Stock initial	2026-10-31 10:02:07.495	cmvw8f85i0017qq6ocd8778oo	\N	\N
cmvw8f85o001dqq6o237yeg2m	IN	10	10	Stock initial	2026-10-31 10:02:07.5	cmvw8f85o001cqq6oaygxqgbz	\N	\N
cmvw8f85q001gqq6o8i0q5qe6	IN	10	10	Stock initial	2026-10-31 10:02:07.503	cmvw8f85q001fqq6ozbam5ryu	\N	\N
cmvw8f85t001jqq6olsaf7x26	IN	10	10	Stock initial	2026-10-31 10:02:07.506	cmvw8f85t001iqq6obdxmgjfb	\N	\N
cmvw8f85w001mqq6om3dq75mi	IN	10	10	Stock initial	2026-10-31 10:02:07.508	cmvw8f85w001lqq6o1v3et7q1	\N	\N
cmvw8f85z001pqq6olzxp3wgs	IN	10	10	Stock initial	2026-10-31 10:02:07.511	cmvw8f85z001oqq6ouydrd0xk	\N	\N
cmvw8f861001sqq6oh75k8xpq	IN	10	10	Stock initial	2026-10-31 10:02:07.514	cmvw8f861001rqq6omxiprwq5	\N	\N
cmvw8f867001xqq6oa4tfekcp	IN	10	10	Stock initial	2026-10-31 10:02:07.519	cmvw8f867001wqq6ovzanu2ym	\N	\N
cmvw8f86a0020qq6o4qgecjm5	IN	10	10	Stock initial	2026-10-31 10:02:07.522	cmvw8f86a001zqq6o9e5azlat	\N	\N
cmvw8f86d0023qq6omwt9qpv8	IN	10	10	Stock initial	2026-10-31 10:02:07.525	cmvw8f86c0022qq6olr9uaf6b	\N	\N
cmvw8f86f0026qq6o62gtlc9i	IN	10	10	Stock initial	2026-10-31 10:02:07.528	cmvw8f86f0025qq6obpynxohc	\N	\N
cmvw8f86i0029qq6owmzstb02	IN	10	10	Stock initial	2026-10-31 10:02:07.53	cmvw8f86i0028qq6of8jq9c8y	\N	\N
cmvw8f86l002cqq6o5138rqyd	IN	10	10	Stock initial	2026-10-31 10:02:07.533	cmvw8f86l002bqq6ohq5v5qmd	\N	\N
cmvw8f86q002hqq6okissl40v	IN	10	10	Stock initial	2026-10-31 10:02:07.539	cmvw8f86q002gqq6onxk8kee3	\N	\N
cmvw8f86t002kqq6oglp7weg9	IN	10	10	Stock initial	2026-10-31 10:02:07.542	cmvw8f86t002jqq6owt252hhn	\N	\N
cmvw8f86w002nqq6oyc28h5sv	IN	10	10	Stock initial	2026-10-31 10:02:07.545	cmvw8f86w002mqq6omt3ds940	\N	\N
cmvw8f86z002qqq6orc98b26p	IN	10	10	Stock initial	2026-10-31 10:02:07.548	cmvw8f86z002pqq6o3wtrxmwz	\N	\N
cmvw8f872002tqq6odrzl1mnk	IN	10	10	Stock initial	2026-10-31 10:02:07.551	cmvw8f872002sqq6o9zxl54g2	\N	\N
cmvw8f876002wqq6om3vgjgcf	IN	10	10	Stock initial	2026-10-31 10:02:07.554	cmvw8f876002vqq6oohpn0bgs	\N	\N
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "passwordHash", role, "createdAt", "photoUrl", gender) FROM stdin;
cmvuyby2x0000qq5kup7x750u	Tiana	tiana@gmail.com	scrypt$cf80e044a5ce2b7eac045b39fb765fbe$f030581d636125663befefc95ebae7d38a23e0ae3de71595e310306f5e57f78d42f1ad541c65731c55bfd3fc44cfc41d7608c9097615830435ba4cc5a5026487	VENTE	2026-10-30 12:31:52.132	\N	MALE
cmvv1r5im0003qq5kdy1s4gkv	Hery	hery@gmail.com	scrypt$55356019b0ca597db53c9668c7369e68$5061223394fb3f09e3248dff86a839a14f7e302defdc73cc2945a82df475b2bd77a3023c65c436b94f79194be614231829f2be5af1bd345b8deea68c5130aa18	STOCK	2026-10-30 14:07:40.463	\N	MALE
cmvvw379i0000qqmggf4i5160	Navalona	navalona@gmail.com	scrypt$2f500e5ff1f1d26a45a89d4b583e2339$d2178faa23d1467e833ac14b52981235f11a1d69a641f80fe90eb37a9c44d7a1985359f6f75b6edea0f15314cc1ea87ee634aeaccc1eab7e9807251971490b03	VENTE	2026-10-31 04:16:51.079	\N	FEMALE
cmvuwmn9e0000qq98yxo9tyyb	Heritiana	rasolomananaheritiana@gmail.com	scrypt$1d21417a840fd03eec00d040fdf793a0$6b7ed25deb57fb9635826fe5a799a51049cc4653ec9d0d5a1a291ff26743f56f898bfee3f915c26874c5f9b2003aae2da8c9128796d2dac11cb620a1f73fedce	ADMIN	2026-10-30 11:44:12.098	/personnels/avatar4.png	MALE
cmvw8f8320003qq6ok54yycdf	Jean	jean@gmail.com	scrypt$d306f190d09f4bb333a3ed5132fadae6$11c28f4d058fdf528246e0f60a18e98a09448afc50567492a4fafa459b606b3a80d2e7272862d4548914e6c3d1fd3c74b43d4cadb3d0c481a4471be22770745e	VENTE	2026-10-31 10:02:07.407	\N	MALE
\.


--
-- Name: Order_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Order_number_seq"', 9, true);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: StockMovement StockMovement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: Order_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_createdAt_idx" ON public."Order" USING btree ("createdAt");


--
-- Name: Order_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Order_number_key" ON public."Order" USING btree (number);


--
-- Name: Product_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");


--
-- Name: Product_isFeatured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_isFeatured_idx" ON public."Product" USING btree ("isFeatured");


--
-- Name: StockMovement_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StockMovement_createdAt_idx" ON public."StockMovement" USING btree ("createdAt");


--
-- Name: StockMovement_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StockMovement_productId_idx" ON public."StockMovement" USING btree ("productId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Category Category_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Category Category_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockMovement StockMovement_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StockMovement StockMovement_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockMovement StockMovement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict xd3MUeEtXBDnMYVdzOfvbcZqVg8pyZ1gjHetSf3ChFkzChJUIUhqWom5qr9ZJud

