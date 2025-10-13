export interface Menu {
  id: number;
  title: string;
  newTab: boolean;
  path: string;
  submenu?: Menu[];
}
