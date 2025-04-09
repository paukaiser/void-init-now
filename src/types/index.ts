
export interface Task {
  id: string;
  contactName: string;
  phoneNumber: string;
  email: string;
  restaurantName: string;
  cuisine: string;
  createdAt: string;
  dueDate: string;
  isRead: boolean;
  completed?: boolean;
  disqualified?: boolean;
  disqualifyReason?: string;
  disqualifyOtherReason?: string;
}

export type SalesRegion = 
  | "Augsburg"
  | "Berlin"
  | "Bielefeld"
  | "Bonn"
  | "Dortmund"
  | "Dresden"
  | "Duisburg"
  | "Düsseldorf"
  | "Frankfurt"
  | "Hamburg"
  | "Hannover"
  | "Köln"
  | "Landshut"
  | "Leipzig"
  | "Mannheim"
  | "München"
  | "München Area"
  | "Nürnberg"
  | "Other"
  | "Regensburg"
  | "Stuttgart";

export type Cuisine = 
  | "African"
  | "Burger"
  | "Cafe"
  | "Chinese"
  | "Chinese - All you can eat"
  | "Chinese - Hotpot"
  | "Chinese - Malatang"
  | "Döner"
  | "Fine Dining"
  | "French"
  | "German"
  | "German - Wirtshaus"
  | "Greek"
  | "Healthy/Salad/Bowl"
  | "Indian"
  | "Italian"
  | "Japanese"
  | "Japanese - BBQ"
  | "Japanese - Buffet"
  | "Japanese - Sushi"
  | "Korean"
  | "Korean - BBQ"
  | "Mediterranean"
  | "Mexican"
  | "Middle-Eastern"
  | "Other"
  | "Russian"
  | "Steakhouse"
  | "Tapas"
  | "Thai"
  | "Turkish"
  | "Vietnamese";
