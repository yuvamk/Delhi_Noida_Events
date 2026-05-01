export type RootStackParamList = {
  MainTabs: undefined;
  EventDetail: { eventId: string };
  Search: { query?: string } | undefined;
  Events: { category?: string; sort?: string; city?: string; featured?: boolean } | undefined;
  DelhiEvents: undefined;
  NoidaEvents: undefined;
  Login: undefined;
  Register: undefined;
  About: undefined;
};

export type TabParamList = {
  Home: undefined;
  Events: undefined;
  Bookmarks: undefined;
  Profile: undefined;
};
