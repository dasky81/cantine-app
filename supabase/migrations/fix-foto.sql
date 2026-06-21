-- Migration: aggiorna foto_principale di tutte le cantine con URL Unsplash funzionanti
-- Formato: ?w=800 ottimizzato per card (CantineCard 192px height)

-- ============================================================
-- TOSCANA
-- ============================================================

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800'
WHERE slug = 'antinori-chianti-classico';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800'
WHERE slug = 'castello-banfi';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'
WHERE slug = 'san-guido-sassicaia';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800'
WHERE slug = 'ornellaia';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800'
WHERE slug = 'fontodi';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800'
WHERE slug = 'vernaccia-san-gimignano';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'
WHERE slug = 'poliziano-montepulciano';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800'
WHERE slug = 'morellino-scansano';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800'
WHERE slug = 'montecucco-sangiovese';

-- ============================================================
-- PIEMONTE
-- ============================================================

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'
WHERE slug = 'gaja-barbaresco';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800'
WHERE slug = 'barolo-borgogno';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800'
WHERE slug = 'moscato-canelli';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800'
WHERE slug = 'roero-arneis';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800'
WHERE slug = 'ceretto-alba';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'
WHERE slug = 'fontanafredda';

-- ============================================================
-- VENETO
-- ============================================================

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'
WHERE slug = 'allegrini-amarone';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800'
WHERE slug = 'masi-amarone';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800'
WHERE slug = 'prosecco-conegliano';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800'
WHERE slug = 'soave-pieropan';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800'
WHERE slug = 'bardolino-guerrieri';

-- ============================================================
-- SICILIA
-- ============================================================

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800'
WHERE slug = 'planeta-sicilia';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800'
WHERE slug = 'etna-benanti';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'
WHERE slug = 'marsala-florio';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800'
WHERE slug = 'nero-avola-cusumano';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800'
WHERE slug = 'cerasuolo-vittoria';

-- ============================================================
-- PUGLIA
-- ============================================================

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'
WHERE slug = 'primitivo-manduria';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800'
WHERE slug = 'feudi-san-marzano';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800'
WHERE slug = 'rivera-castel-del-monte';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800'
WHERE slug = 'tormaresca-negroamaro';

-- ============================================================
-- CAMPANIA
-- ============================================================

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'
WHERE slug = 'feudi-san-gregorio';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800'
WHERE slug = 'greco-di-tufo';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800'
WHERE slug = 'falanghina-sannio';

-- ============================================================
-- FRIULI-VENEZIA GIULIA
-- ============================================================

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800'
WHERE slug = 'livio-felluga';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800'
WHERE slug = 'ramato-friuli';

-- ============================================================
-- SARDEGNA
-- ============================================================

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800'
WHERE slug = 'cannonau-argiolas';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800'
WHERE slug = 'vermentino-gallura';

-- ============================================================
-- UMBRIA
-- ============================================================

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'
WHERE slug = 'sagrantino-arnaldo-caprai';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800'
WHERE slug = 'orvieto-barberani';

-- ============================================================
-- ALTRE REGIONI
-- ============================================================

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800'
WHERE slug = 'franciacorta-bellavista';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800'
WHERE slug = 'teroldego-foradori';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800'
WHERE slug = 'alto-adige-lageder';

UPDATE cantine SET foto_principale = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'
WHERE slug = 'aglianico-basilicata';
