-- ============================================================
-- SCHEMA SQL — cantine.app
-- Esegui nell'SQL Editor di Supabase
-- ============================================================

-- Abilita estensione vettori per ricerca semantica
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- TABELLE
-- ============================================================

CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  nome TEXT,
  cognome TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cantine (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descrizione TEXT,
  descrizione_breve TEXT,
  regione TEXT NOT NULL,
  provincia TEXT,
  comune TEXT,
  indirizzo TEXT,
  lat FLOAT,
  lng FLOAT,
  telefono TEXT,
  email TEXT,
  sito_web TEXT,
  instagram TEXT,
  orari_apertura TEXT,
  prezzo_degustazione TEXT,
  vini_prodotti TEXT[],
  denominazioni TEXT[],
  ettari_vigneto INTEGER,
  bottiglie_anno INTEGER,
  certificazioni TEXT[],
  lingua_visita TEXT[],
  servizi TEXT[],
  foto_principale TEXT,
  foto_galleria TEXT[],
  verified BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  owner_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  embedding vector(1536)
);

CREATE TABLE post (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  titolo TEXT NOT NULL,
  contenuto TEXT,
  excerpt TEXT,
  cover_url TEXT,
  autore_id UUID REFERENCES profiles(id),
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  tag TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ricerche_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  risultati_ids UUID[],
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE preferiti (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  cantina_id UUID REFERENCES cantine(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cantina_id)
);

CREATE TABLE rivendicazioni (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cantina_id UUID REFERENCES cantine(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  nome_referente TEXT,
  email_referente TEXT,
  telefono TEXT,
  messaggio TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cantine ENABLE ROW LEVEL SECURITY;
ALTER TABLE post ENABLE ROW LEVEL SECURITY;
ALTER TABLE ricerche_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferiti ENABLE ROW LEVEL SECURITY;
ALTER TABLE rivendicazioni ENABLE ROW LEVEL SECURITY;

-- Cantine: lettura pubblica
CREATE POLICY "cantine_select_public" ON cantine FOR SELECT USING (true);
CREATE POLICY "cantine_all_admin" ON cantine FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Post: lettura pubblica se pubblicati
CREATE POLICY "post_select_published" ON post FOR SELECT USING (published = true);
CREATE POLICY "post_all_admin" ON post FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Profili: ogni utente vede/modifica il proprio
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Preferiti: ogni utente gestisce i propri
CREATE POLICY "preferiti_own" ON preferiti USING (auth.uid() = user_id);

-- Ricerche log: insert pubblico
CREATE POLICY "ricerche_insert" ON ricerche_log FOR INSERT WITH CHECK (true);

-- Rivendicazioni: chiunque può inviare, admin gestisce
CREATE POLICY "rivendicazioni_insert" ON rivendicazioni FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rivendicazioni_select_own" ON rivendicazioni FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "rivendicazioni_all_admin" ON rivendicazioni FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- TRIGGER: auto-crea profilo al signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INDICI per performance
-- ============================================================

CREATE INDEX idx_cantine_regione ON cantine(regione);
CREATE INDEX idx_cantine_slug ON cantine(slug);
CREATE INDEX idx_cantine_featured ON cantine(featured);
CREATE INDEX idx_post_slug ON post(slug);
CREATE INDEX idx_post_published ON post(published, published_at);

-- ============================================================
-- SEED: 40 cantine reali italiane
-- ============================================================

INSERT INTO cantine (slug, nome, descrizione_breve, regione, provincia, comune, lat, lng, vini_prodotti, denominazioni, certificazioni, servizi, prezzo_degustazione, foto_principale, verified, featured) VALUES

-- TOSCANA
('antinori-chianti-classico', 'Marchesi Antinori', 'Una delle famiglie vinicole più antiche d''Italia, 26 generazioni di storia del vino toscano.', 'Toscana', 'Firenze', 'Bargino', 43.5831, 11.2147, ARRAY['Chianti Classico', 'Tignanello', 'Solaia'], ARRAY['DOCG', 'IGT'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita cantina', 'Museo', 'Ristorante'], '€30–80 a persona', 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=800', TRUE, TRUE),

('castello-banfi', 'Castello Banfi', 'Vasta tenuta nel cuore del Brunello, con castello medievale e enoteca premiata.', 'Toscana', 'Siena', 'Montalcino', 42.9503, 11.4891, ARRAY['Brunello di Montalcino', 'Rosso di Montalcino', 'Moscadello'], ARRAY['DOCG', 'DOC'], ARRAY['Sostenibile'], ARRAY['Degustazione', 'Visita guidata', 'Ristorante', 'Pernottamento', 'Enoteca'], '€25–60 a persona', 'https://images.unsplash.com/photo-1474540412665-1cdae210ae6b?w=800', TRUE, TRUE),

('san-guido-sassicaia', 'Tenuta San Guido', 'La cantina del Sassicaia, il primo Super Tuscan con DOC dedicata. Icona mondiale.', 'Toscana', 'Livorno', 'Bolgheri', 43.2289, 10.6241, ARRAY['Sassicaia', 'Guidalberto', 'Le Difese'], ARRAY['DOC', 'IGT'], ARRAY[]::TEXT[], ARRAY['Degustazione su appuntamento'], '€50–120 a persona', 'https://images.unsplash.com/photo-1599481238640-4c1288750d7a?w=800', TRUE, FALSE),

('fontodi', 'Fattoria Fontodi', 'Cantina biodinamica nel cuore del Chianti Classico, pioniera del Flaccianello.', 'Toscana', 'Firenze', 'Panzano in Chianti', 43.5631, 11.3089, ARRAY['Chianti Classico', 'Flaccianello', 'Meriggio'], ARRAY['DOCG', 'IGT'], ARRAY['Biodinamico'], ARRAY['Degustazione', 'Visita vigneti'], '€20–45 a persona', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', TRUE, FALSE),

('vernaccia-san-gimignano', 'Fattoria San Michele', 'Produttore storico di Vernaccia di San Gimignano in posizione panoramica sulle torri.', 'Toscana', 'Siena', 'San Gimignano', 43.4677, 11.0434, ARRAY['Vernaccia di San Gimignano', 'Chianti Colli Senesi'], ARRAY['DOCG', 'DOC'], ARRAY['Biologico'], ARRAY['Degustazione', 'Vendita diretta', 'Vista panoramica'], '€12–25 a persona', 'https://images.unsplash.com/photo-1566086081036-2c62a5de8dc5?w=800', FALSE, FALSE),

('poliziano-montepulciano', 'Poliziano', 'Cantina di riferimento per il Vino Nobile di Montepulciano, moderna e accogliente.', 'Toscana', 'Siena', 'Montepulciano', 43.0970, 11.7837, ARRAY['Vino Nobile di Montepulciano', 'Rosso di Montepulciano', 'Asinone'], ARRAY['DOCG', 'DOC'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita cantina', 'Vendita diretta'], '€18–40 a persona', 'https://images.unsplash.com/photo-1543418219-44e30b283a7b?w=800', TRUE, FALSE),

('morellino-scansano', 'Erik Banti', 'Cantina moderna nel Morellino, con vigneti sul promontorio della Maremma.', 'Toscana', 'Grosseto', 'Scansano', 42.6870, 11.3337, ARRAY['Morellino di Scansano', 'Ciabatta', 'Aquilaia'], ARRAY['DOCG', 'IGT'], ARRAY['Biologico'], ARRAY['Degustazione', 'Visita guidata', 'Enoteca'], '€15–30 a persona', 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800', FALSE, FALSE),

('ornellaia', 'Ornellaia', 'Tenuta d''eccellenza a Bolgheri, autrice dell''omonimo Supertuscan di fama internazionale.', 'Toscana', 'Livorno', 'Bolgheri', 43.2134, 10.6389, ARRAY['Ornellaia', 'Masseto', 'Le Serre Nuove'], ARRAY['DOC', 'IGT'], ARRAY[]::TEXT[], ARRAY['Degustazione su appuntamento', 'Arte in cantina'], '€60–150 a persona', 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800', TRUE, TRUE),

-- PIEMONTE
('gaja-barbaresco', 'Gaja', 'La cantina simbolo del Piemonte vinicolo, con vini di fama mondiale da Barbaresco.', 'Piemonte', 'Cuneo', 'Barbaresco', 44.6935, 8.1001, ARRAY['Barbaresco', 'Barolo', 'Gaia e Rey', 'Sori Tildin'], ARRAY['DOCG'], ARRAY[]::TEXT[], ARRAY['Degustazione su appuntamento'], '€80–200 a persona', 'https://images.unsplash.com/photo-1587282650002-2c3bd80c9e4f?w=800', TRUE, TRUE),

('barolo-borgogno', 'Borgogno', 'Storica cantina di Barolo fondata nel 1761, tradizione e qualità senza compromessi.', 'Piemonte', 'Cuneo', 'Barolo', 44.6058, 7.9440, ARRAY['Barolo', 'Barbera d''Alba', 'Dolcetto d''Alba'], ARRAY['DOCG', 'DOC'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita cantina storica', 'Museo'], '€25–55 a persona', 'https://images.unsplash.com/photo-1587282650002-2c3bd80c9e4f?w=800', TRUE, FALSE),

('moscato-canelli', 'Contratto', 'Cantina spumantistica storica a Canelli, con cattedrali sotterranee Patrimonio UNESCO.', 'Piemonte', 'Asti', 'Canelli', 44.7177, 8.2902, ARRAY['Moscato d''Asti', 'Asti Spumante', 'Alta Langa'], ARRAY['DOCG'], ARRAY[]::TEXT[], ARRAY['Visita cattedrali sotterranee', 'Degustazione', 'Enoteca'], '€20–40 a persona', 'https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=800', TRUE, FALSE),

('roero-arneis', 'Bruno Giacosa', 'Produttore leggendario del Piemonte, maestro del Barbaresco e del Barolo.', 'Piemonte', 'Cuneo', 'Neive', 44.7135, 8.1211, ARRAY['Barbaresco', 'Barolo', 'Arneis', 'Grignolino'], ARRAY['DOCG', 'DOC'], ARRAY[]::TEXT[], ARRAY['Degustazione su appuntamento', 'Vendita diretta'], '€30–70 a persona', 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=800', TRUE, FALSE),

('ceretto-alba', 'Ceretto', 'Azienda vitivinicola con la cappella di Solferino e vini iconici delle Langhe.', 'Piemonte', 'Cuneo', 'Alba', 44.7005, 8.0354, ARRAY['Barolo', 'Barbaresco', 'Dolcetto d''Alba', 'Moscato d''Asti'], ARRAY['DOCG', 'DOC'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Arte contemporanea', 'Ristorante'], '€30–65 a persona', 'https://images.unsplash.com/photo-1566954288152-95a3b2e5ef70?w=800', TRUE, FALSE),

('fontanafredda', 'Fontanafredda', 'Ex riserva di caccia della Casa Reale Savoia, oggi cantina storica nel cuore del Barolo.', 'Piemonte', 'Cuneo', 'Serralunga d''Alba', 44.6147, 7.9742, ARRAY['Barolo', 'Barbera d''Asti', 'Asti Spumante'], ARRAY['DOCG'], ARRAY['Biologico'], ARRAY['Degustazione', 'Visita guidata', 'Ristorante', 'Hotel', 'Enoteca'], '€20–50 a persona', 'https://images.unsplash.com/photo-1569396116180-210c182bedb8?w=800', TRUE, FALSE),

-- VENETO
('allegrini-amarone', 'Allegrini', 'Cantina storica della Valpolicella, autrice di Amarone di grande eleganza.', 'Veneto', 'Verona', 'Fumane', 45.5589, 10.8801, ARRAY['Amarone della Valpolicella', 'Recioto', 'Palazzo della Torre', 'Soave'], ARRAY['DOCG', 'DOC'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita guidata', 'Vendita diretta'], '€20–50 a persona', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800', TRUE, TRUE),

('masi-amarone', 'Masi Agricola', 'Pionieri del ripasso e dell''Amarone moderno in Valpolicella dal 1772.', 'Veneto', 'Verona', 'Sant''Ambrogio di Valpolicella', 45.5201, 10.8421, ARRAY['Amarone', 'Ripasso', 'Recioto', 'Soave'], ARRAY['DOCG', 'DOC'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita storica', 'Museo'], '€18–45 a persona', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800', TRUE, FALSE),

('prosecco-conegliano', 'Bisol 1542', 'Cantina storica del Prosecco Superiore di Valdobbiadene, tra i vigneti UNESCO.', 'Veneto', 'Treviso', 'Valdobbiadene', 45.8964, 12.0094, ARRAY['Prosecco Superiore', 'Rive di Gai', 'Cartizze'], ARRAY['DOCG'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita vigneti UNESCO', 'Enoteca'], '€15–35 a persona', 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800', TRUE, FALSE),

('soave-pieropan', 'Pieropan', 'La cantina di riferimento per il Soave Classico, vini di straordinaria longevità.', 'Veneto', 'Verona', 'Soave', 45.4178, 11.2494, ARRAY['Soave Classico', 'Calvarino', 'La Rocca'], ARRAY['DOC'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita guidata'], '€15–30 a persona', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800', TRUE, FALSE),

('bardolino-guerrieri', 'Guerrieri Rizzardi', 'Cantina storica sul lago di Garda con museo del vino e giardini all''italiana.', 'Veneto', 'Verona', 'Bardolino', 45.5466, 10.7247, ARRAY['Bardolino', 'Soave', 'Amarone', 'Custoza'], ARRAY['DOC', 'DOCG'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Museo del vino', 'Giardini', 'Vendita diretta'], '€12–28 a persona', 'https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?w=800', FALSE, FALSE),

-- SICILIA
('planeta-sicilia', 'Planeta', 'Cantina che ha rivoluzionato il vino siciliano, con tenute nelle zone più vocate dell''isola.', 'Sicilia', 'Agrigento', 'Menfi', 37.5998, 12.9668, ARRAY['Nero d''Avola', 'Chardonnay', 'Syrah', 'Fiano'], ARRAY['DOC', 'IGT'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita cantine multiple', 'Agriturismo', 'Cucina siciliana'], '€20–45 a persona', 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=800', TRUE, TRUE),

('etna-benanti', 'Benanti', 'Pioniere dell''Etna DOC, recupero delle antiche vigne di nerello mascalese ad alta quota.', 'Sicilia', 'Catania', 'Viagrande', 37.6189, 15.1115, ARRAY['Etna Rosso', 'Etna Bianco', 'Nerello Mascalese', 'Carricante'], ARRAY['DOC'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita vigneti Etna', 'Trekking vigneti'], '€25–55 a persona', 'https://images.unsplash.com/photo-1464920551230-04b4c9004723?w=800', TRUE, FALSE),

('marsala-florio', 'Cantine Florio', 'La casa del Marsala dal 1833, con storiche cantine di invecchiamento a Marsala.', 'Sicilia', 'Trapani', 'Marsala', 37.7988, 12.4363, ARRAY['Marsala', 'Moscato di Pantelleria', 'Passito'], ARRAY['DOC'], ARRAY[]::TEXT[], ARRAY['Visita storica', 'Degustazione', 'Museo'], '€10–25 a persona', 'https://images.unsplash.com/photo-1445258856645-1e6f9bdbd0d8?w=800', TRUE, FALSE),

('nero-avola-cusumano', 'Cusumano', 'Grande cantina siciliana con vigneti in quattro zone, moderna e tecnologica.', 'Sicilia', 'Palermo', 'Partinico', 38.0474, 13.1200, ARRAY['Nero d''Avola', 'Insolia', 'Syrah', 'Grillo'], ARRAY['DOC', 'IGT'], ARRAY['Sostenibile'], ARRAY['Degustazione', 'Visita cantina', 'Vendita diretta'], '€15–35 a persona', 'https://images.unsplash.com/photo-1476914306697-faa5e87a1b9a?w=800', FALSE, FALSE),

-- PUGLIA
('primitivo-manduria', 'Pervini - Produttori di Manduria', 'La principale cooperativa del Primitivo di Manduria DOC.', 'Puglia', 'Taranto', 'Manduria', 40.3967, 17.6352, ARRAY['Primitivo di Manduria', 'Primitivo di Manduria Dolce Naturale', 'Salice Salentino'], ARRAY['DOC', 'DOCG'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita cantina', 'Vendita diretta'], '€10–20 a persona', 'https://images.unsplash.com/photo-1469849272843-cc1d9dcd1b7a?w=800', TRUE, FALSE),

('feudi-san-marzano', 'Feudi di San Marzano', 'Cantina cooperativa salentina di qualità, ambasciatori del Primitivo nel mondo.', 'Puglia', 'Taranto', 'San Marzano di San Giuseppe', 40.4456, 17.5099, ARRAY['Primitivo di Manduria', 'Negroamaro', 'Verdeca'], ARRAY['DOC'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita', 'Vendita diretta'], '€12–25 a persona', 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=800', FALSE, FALSE),

('rivera-castel-del-monte', 'Rivera', 'Cantina storica della Murgia barese, produttori storici del Castel del Monte DOC.', 'Puglia', 'Barletta-Andria-Trani', 'Andria', 41.2228, 16.2954, ARRAY['Castel del Monte', 'Aglianico', 'Nero di Troia'], ARRAY['DOC', 'DOCG'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita cantina', 'Enoteca'], '€15–30 a persona', 'https://images.unsplash.com/photo-1590500838108-eb5cc8e9db27?w=800', TRUE, FALSE),

('tormaresca-negroamaro', 'Tormaresca', 'Tenute Antinori in Puglia, modello di viticultura moderna nel Salento e nella Murgia.', 'Puglia', 'Brindisi', 'Oria', 40.5016, 17.6447, ARRAY['Negroamaro', 'Primitivo', 'Aglianico'], ARRAY['DOC', 'IGT'], ARRAY['Sostenibile'], ARRAY['Degustazione su appuntamento', 'Visita agrituristico'], '€18–40 a persona', 'https://images.unsplash.com/photo-1464292888890-b6a1ecfc7b44?w=800', FALSE, FALSE),

-- CAMPANIA
('feudi-san-gregorio', 'Feudi di San Gregorio', 'La cantina simbolo della Campania vitivinicola, con il Taurasi DOCG come flagship.', 'Campania', 'Avellino', 'Sorbo Serpico', 40.9453, 14.9898, ARRAY['Taurasi', 'Greco di Tufo', 'Fiano di Avellino', 'Falanghina'], ARRAY['DOCG', 'DOC'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita cantina', 'Ristorante Marennà', 'Museo'], '€20–50 a persona', 'https://images.unsplash.com/photo-1509515837298-2c67a3933321?w=800', TRUE, TRUE),

('greco-di-tufo', 'Mastroberardino', 'Custodi della tradizione vinicola irpina dal 1878, rinascita dell''Aglianico.', 'Campania', 'Avellino', 'Atripalda', 40.9189, 14.8293, ARRAY['Greco di Tufo', 'Fiano di Avellino', 'Taurasi', 'Lacryma Christi'], ARRAY['DOCG', 'DOC'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita storica', 'Enoteca'], '€15–40 a persona', 'https://images.unsplash.com/photo-1470158499416-75be9aa0c4db?w=800', TRUE, FALSE),

('falanghina-sannio', 'Mustilli', 'Pionieri della Falanghina del Sannio, cantina familiare a Sant''Agata de'' Goti.', 'Campania', 'Benevento', 'Sant''Agata de'' Goti', 41.0944, 14.5014, ARRAY['Falanghina del Sannio', 'Aglianico', 'Piedirosso'], ARRAY['DOC'], ARRAY['Biologico'], ARRAY['Degustazione', 'Visita borgo medievale', 'Vendita diretta'], '€12–25 a persona', 'https://images.unsplash.com/photo-1527237782798-9f49f9e1c3c8?w=800', FALSE, FALSE),

-- FRIULI
('livio-felluga', 'Livio Felluga', 'Grande maison del Friuli orientale, autore del celebre Terre Alte Collio.', 'Friuli-Venezia Giulia', 'Gorizia', 'Cormons', 45.9606, 13.4639, ARRAY['Collio Bianco', 'Pinot Grigio', 'Terre Alte', 'Refosco'], ARRAY['DOC'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita guidata', 'Enoteca'], '€20–50 a persona', 'https://images.unsplash.com/photo-1473135589745-bc35dcb7a65c?w=800', TRUE, FALSE),

('ramato-friuli', 'Radikon', 'Cantina artigianale pioniera dei vini orange e della macerazione prolungata.', 'Friuli-Venezia Giulia', 'Gorizia', 'Oslavia', 45.9490, 13.6254, ARRAY['Ribolla Gialla', 'Tocai Friulano', 'Merlot'], ARRAY['DOC'], ARRAY['Biodinamico'], ARRAY['Degustazione su appuntamento'], '€30–60 a persona', 'https://images.unsplash.com/photo-1489549132488-d00b7eee80f1?w=800', TRUE, FALSE),

-- SARDEGNA
('cannonau-argiolas', 'Argiolas', 'La più importante cantina sarda, custode del Cannonau e del Turriga.', 'Sardegna', 'Cagliari', 'Serdiana', 39.2880, 9.1429, ARRAY['Cannonau di Sardegna', 'Turriga', 'Vermentino', 'Carignano'], ARRAY['DOC', 'IGT'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita cantina', 'Vendita diretta'], '€15–35 a persona', 'https://images.unsplash.com/photo-1476563590391-ee9bc17b2e01?w=800', TRUE, TRUE),

('vermentino-gallura', 'Siddùra', 'Cantina moderna nella Gallura, specializzata nel Vermentino di Gallura DOCG.', 'Sardegna', 'Sassari', 'Luogosanto', 41.0436, 9.2078, ARRAY['Vermentino di Gallura', 'Cannonau', 'Moscato di Sardegna'], ARRAY['DOCG', 'DOC'], ARRAY['Biologico'], ARRAY['Degustazione', 'Degustazione panoramica', 'Enoteca'], '€15–30 a persona', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800', FALSE, FALSE),

-- UMBRIA
('sagrantino-arnaldo-caprai', 'Arnaldo Caprai', 'La cantina che ha fatto del Sagrantino di Montefalco un vino di fama mondiale.', 'Umbria', 'Perugia', 'Montefalco', 42.8888, 12.6583, ARRAY['Sagrantino di Montefalco', 'Rosso di Montefalco', 'Grecante'], ARRAY['DOCG', 'DOC'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita cantina moderna', 'Enoteca'], '€20–50 a persona', 'https://images.unsplash.com/photo-1563132337-f159f484226c?w=800', TRUE, FALSE),

('orvieto-barberani', 'Barberani', 'Storica cantina umbra a Baschi, con Orvieto Classico Superiore di eccellenza.', 'Umbria', 'Terni', 'Baschi', 42.6706, 12.2126, ARRAY['Orvieto Classico', 'Lago di Corbara', 'Foresto'], ARRAY['DOC'], ARRAY['Biologico'], ARRAY['Degustazione', 'Visita con vista sul lago', 'Vendita diretta'], '€12–25 a persona', 'https://images.unsplash.com/photo-1536623975707-c4b3b2af565d?w=800', FALSE, FALSE),

-- ALTRE REGIONI
('franciacorta-bellavista', 'Bellavista', 'Cantina di riferimento per il Franciacorta DOCG, metodo classico di altissimo livello.', 'Lombardia', 'Brescia', 'Erbusco', 45.6166, 10.0345, ARRAY['Franciacorta', 'Curtefranca'], ARRAY['DOCG', 'DOC'], ARRAY[]::TEXT[], ARRAY['Degustazione', 'Visita cantina contemporanea', 'Arte'], '€25–65 a persona', 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800', TRUE, TRUE),

('teroldego-foradori', 'Foradori', 'Cantina trentina biodinamica, protagonista della rinascita del Teroldego Rotaliano.', 'Trentino-Alto Adige', 'Trento', 'Mezzolombardo', 46.1197, 11.0820, ARRAY['Teroldego Rotaliano', 'Nosiola', 'Manzoni Bianco'], ARRAY['DOC'], ARRAY['Biodinamico'], ARRAY['Degustazione su appuntamento', 'Visita vigneti'], '€20–45 a persona', 'https://images.unsplash.com/photo-1569396116180-210c182bedb8?w=800', TRUE, FALSE),

('alto-adige-lageder', 'Alois Lageder', 'Produttore pioniere della sostenibilità in Alto Adige, biodinamico da trent''anni.', 'Trentino-Alto Adige', 'Bolzano', 'Magrè', 46.3854, 11.2578, ARRAY['Pinot Grigio', 'Gewürztraminer', 'Lagrein', 'Pinot Nero'], ARRAY['DOC'], ARRAY['Biodinamico', 'Biologico'], ARRAY['Degustazione', 'Centro visitatori', 'Ristorante', 'Arte'], '€20–50 a persona', 'https://images.unsplash.com/photo-1566954288152-95a3b2e5ef70?w=800', TRUE, FALSE),

('aglianico-basilicata', 'Cantine del Notaio', 'Cantina lucana in grotte tufo, specializzata nell''Aglianico del Vulture DOCG.', 'Basilicata', 'Potenza', 'Rionero in Vulture', 40.9215, 15.6705, ARRAY['Aglianico del Vulture', 'Il Sigillo', 'La Firma'], ARRAY['DOCG'], ARRAY[]::TEXT[], ARRAY['Degustazione in grotta', 'Visita cantine tufo', 'Enoteca'], '€18–40 a persona', 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=800', TRUE, FALSE),

('cerasuolo-vittoria', 'COS', 'Piccola cantina siciliana biodinamica a Vittoria, pionieri del vino naturale in Sicilia.', 'Sicilia', 'Ragusa', 'Vittoria', 36.9547, 14.5329, ARRAY['Cerasuolo di Vittoria', 'Pithos', 'Rami'], ARRAY['DOCG', 'IGT'], ARRAY['Biodinamico'], ARRAY['Degustazione su appuntamento'], '€20–40 a persona', 'https://images.unsplash.com/photo-1509515837298-2c67a3933321?w=800', TRUE, FALSE),

('montecucco-sangiovese', 'Col d''Orcia', 'Vasta tenuta ai piedi del Monte Amiata con Brunello e Montecucco eccellenti.', 'Toscana', 'Grosseto', 'Sant''Angelo in Colle', 42.8947, 11.3841, ARRAY['Brunello di Montalcino', 'Rosso di Montalcino', 'Montecucco'], ARRAY['DOCG', 'DOC'], ARRAY['Biologico'], ARRAY['Degustazione', 'Visita tenuta', 'Agriturismo', 'Vendita diretta'], '€22–50 a persona', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', TRUE, FALSE);

-- ============================================================
-- SET ADMIN (sostituisci con la tua email)
-- ============================================================
-- UPDATE profiles SET role = 'admin' WHERE email = 'davide.sarrecchia@gmail.com';
