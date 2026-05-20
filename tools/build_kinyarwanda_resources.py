import csv
import json
import re
from collections import Counter
from pathlib import Path


DATASET_PATH = Path(r"C:\Users\BALIA\Downloads\Compressed\archive\EACLanguageDetectionDataSet.csv")
BACKEND_OUTPUT = Path(r"C:\xampp\htdocs\digital-library\backend\data\kinyarwanda_resources.json")
FRONTEND_OUTPUT = Path(
    r"C:\xampp\htdocs\digital-library\digital-library-main\digital_library\frontend\src\data\kinyarwandaResources.json"
)

CURATED_GLOSSARY = {
    "audio": "amajwi",
    "author": "umwanditsi",
    "book": "igitabo",
    "books": "ibitabo",
    "business": "ubucuruzi",
    "category": "icyiciro",
    "chapter": "igice",
    "child": "umwana",
    "children": "abana",
    "classroom": "ishuri",
    "community": "abaturage",
    "customer": "umukiliya",
    "dashboard": "ikibaho",
    "dictionary": "inkoranyamagambo",
    "education": "uburezi",
    "family": "umuryango",
    "farmer": "umuhinzi",
    "farm": "umurima",
    "fiction": "inkuru mpimbano",
    "food": "ibiryo",
    "good morning": "mwaramutse",
    "health": "ubuzima",
    "hello": "muraho",
    "history": "amateka",
    "hospital": "ibitaro",
    "house": "inzu",
    "knowledge": "ubumenyi",
    "language": "ururimi",
    "library": "isomero",
    "listen": "umva",
    "market": "isoko",
    "medicine": "umuti",
    "money": "amafaranga",
    "mother": "umubyeyi",
    "progress": "aho ugeze",
    "read": "soma",
    "reader": "umusomyi",
    "school": "ishuri",
    "science": "ubumenyi",
    "search": "shakisha",
    "seed": "imbuto",
    "soil": "ubutaka",
    "story": "inkuru",
    "student": "umunyeshuri",
    "teacher": "umwarimu",
    "technology": "ikoranabuhanga",
    "thank you very much": "murakoze cyane",
    "translation": "ubusemuzi",
    "village": "umudugudu",
    "voice": "ijwi",
    "water": "amazi",
    "where is the market": "isoko iri he",
    "work": "akazi",
}

QUALITY_SENTENCES = {
    "rw": [
        "Murakoze cyane.",
        "Mwaramutse, amakuru?",
        "Isoko iri he?",
        "Uyu musomyi akunda igitabo cyiza.",
        "Abana biga neza mu ishuri.",
        "Umuhinzi yita ku butaka no ku mbuto.",
        "Ubumenyi n'uburezi bifasha umuryango gukura.",
        "Ijwi n'amajwi bifasha abasomyi benshi.",
    ],
    "en": [
        "Thank you very much.",
        "Good morning, how are you?",
        "Where is the market?",
        "This reader enjoys a good book.",
        "Children learn well at school.",
        "A farmer takes care of the soil and seed.",
        "Education and knowledge help a family grow.",
        "Voice and audio support more readers.",
    ],
}

STOPWORDS = {
    "the", "and", "for", "that", "with", "this", "from", "have", "your", "will", "you", "are",
    "was", "were", "they", "their", "there", "here", "into", "about", "been", "would", "should",
    "could", "what", "when", "where", "which", "while", "than", "then", "also", "them", "because",
    "these", "those", "some", "more", "most", "many", "much", "such", "very", "each", "every",
}


def find_text_field(headers):
    for candidate in ["Text", "text", "Sentence", "sentence", "Content", "content"]:
        if candidate in headers:
            return candidate
    return headers[0]


def find_language_field(headers):
    for candidate in ["Language", "language", "Label", "label"]:
        if candidate in headers:
            return candidate
    return headers[1]


def normalize_words(text):
    return re.findall(r"[a-zA-ZÀ-ÿ']+", text.lower())


def looks_english(text):
    words = normalize_words(text)
    if len(words) < 4:
        return False
    english_hits = sum(1 for word in words if word in {
        "the", "and", "for", "with", "that", "this", "from", "book", "read", "story", "school", "market"
    })
    return english_hits >= 2


def looks_kinyarwanda(text):
    words = normalize_words(text)
    if len(words) < 4:
        return False
    kinyarwanda_hits = sum(1 for word in words if word in {
        "muri", "kandi", "ariko", "icyo", "abana", "umuntu", "umuryango", "igitabo", "isoko", "murakoze"
    })
    return kinyarwanda_hits >= 1


def load_dataset():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    kinyarwanda_sentences = []
    english_sentences = []

    with DATASET_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        headers = reader.fieldnames or []
        text_field = find_text_field(headers)
        language_field = find_language_field(headers)

        for row in reader:
            text = (row.get(text_field) or "").strip()
            language = (row.get(language_field) or "").strip().lower()

            if not text:
                continue

            if "kinya" in language or "rw" == language or looks_kinyarwanda(text):
                kinyarwanda_sentences.append(text)
                continue

            if "english" in language or language == "en" or looks_english(text):
                english_sentences.append(text)

    return kinyarwanda_sentences, english_sentences


def top_markers(sentences, extra_stopwords=None, limit=120):
    counter = Counter()
    blocked = STOPWORDS | set(extra_stopwords or [])
    for sentence in sentences:
        for word in normalize_words(sentence):
            if len(word) >= 3 and word not in blocked:
                counter[word] += 1
    return [word for word, _count in counter.most_common(limit)]


def build_payload():
    kinyarwanda_sentences, english_sentences = load_dataset()

    payload = {
        "source_dataset": str(DATASET_PATH),
        "sources": [
            "https://historical.fmcusa.org/wp-content/uploads/Dictionary_LoRes_Kinyarwanda-English-English-Kinyarwanda.pdf",
            "https://kinyarwanda.com/translate",
        ],
        "summary": {
            "kinyarwanda_sentences": len(kinyarwanda_sentences),
            "english_sentences": len(english_sentences),
            "curated_glossary_entries": len(CURATED_GLOSSARY),
        },
        "kinyarwanda_markers": top_markers(
            kinyarwanda_sentences + QUALITY_SENTENCES["rw"],
            extra_stopwords={"www", "https", "amakuru"},
        ),
        "english_markers": top_markers(
            english_sentences + QUALITY_SENTENCES["en"],
            extra_stopwords={"good", "morning"},
        ),
        "kinyarwanda_samples": (QUALITY_SENTENCES["rw"] + kinyarwanda_sentences[:24])[:32],
        "english_samples": (QUALITY_SENTENCES["en"] + english_sentences[:24])[:32],
        "quality_pairs": [
            {"en": en_text, "rw": rw_text}
            for en_text, rw_text in zip(QUALITY_SENTENCES["en"], QUALITY_SENTENCES["rw"])
        ],
        "glossary": CURATED_GLOSSARY,
    }

    return payload


def main():
    payload = build_payload()

    BACKEND_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    FRONTEND_OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    serialized = json.dumps(payload, ensure_ascii=False, indent=2)
    BACKEND_OUTPUT.write_text(serialized, encoding="utf-8")
    FRONTEND_OUTPUT.write_text(serialized, encoding="utf-8")

    print(f"Wrote {BACKEND_OUTPUT}")
    print(f"Wrote {FRONTEND_OUTPUT}")


if __name__ == "__main__":
    main()
