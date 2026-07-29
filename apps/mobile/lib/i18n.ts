import { getLocales } from "expo-localization";

// Albanian is the default; English is the fallback locale.
const messages = {
  sq: {
    fleet: "Flota",
    subtitle: "Zgjidhni veturën tuaj dhe rezervoni online.",
    perDay: "/ ditë",
    bookNow: "Rezervo tani",
    seats: "Ulëse",
    doors: "Dyer",
    transmission: "Transmisioni",
    fuel: "Karburanti",
    year: "Viti",
    deposit: "Depozita",
    features: "Veçoritë",
    reviews: "Vlerësimet",
    noReviews: "Ende pa vlerësime.",
    book: "Rezervo",
    pickup: "Data e marrjes",
    return: "Data e kthimit",
    name: "Emri i plotë",
    email: "Email",
    phone: "Telefoni",
    payAndBook: "Paguaj dhe rezervo",
    total: "Totali",
    loading: "Duke u ngarkuar…",
    retry: "Provo përsëri",
    errorLoad: "Diçka shkoi keq.",
    confirmedTitle: "Pagesa u krye!",
    confirmedText: "Rezervimi juaj po konfirmohet. Faleminderit!",
    days: "ditë",
    empty: "Nuk ka vetura.",
  },
  en: {
    fleet: "Fleet",
    subtitle: "Choose your car and book online.",
    perDay: "/ day",
    bookNow: "Book now",
    seats: "Seats",
    doors: "Doors",
    transmission: "Transmission",
    fuel: "Fuel",
    year: "Year",
    deposit: "Deposit",
    features: "Features",
    reviews: "Reviews",
    noReviews: "No reviews yet.",
    book: "Book",
    pickup: "Pick-up date",
    return: "Return date",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    payAndBook: "Pay & book",
    total: "Total",
    loading: "Loading…",
    retry: "Try again",
    errorLoad: "Something went wrong.",
    confirmedTitle: "Payment complete!",
    confirmedText: "Your booking is being confirmed. Thank you!",
    days: "days",
    empty: "No vehicles.",
  },
} as const;

type MessageKey = keyof (typeof messages)["sq"];

const device = getLocales()[0]?.languageCode;
export const locale: "sq" | "en" = device === "en" ? "en" : "sq";

export function t(key: MessageKey): string {
  return messages[locale][key] ?? messages.sq[key];
}
