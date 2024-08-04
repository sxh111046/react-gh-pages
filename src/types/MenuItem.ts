export interface MenuItem {
    name: string;
    id?: string;
    callback?: (item: any) => void;
    className?: string;
    subitems?: MenuItem[];
}