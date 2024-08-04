export interface LayoutNode {
    id: string;
    data: object;
    position: {x: number, y: number }
    type?: string;
    targetPosition?: string;
    sourcePosition?: string;
}