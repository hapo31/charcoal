type Viewport = {
  width: number;
  height: number;
};

export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export default class Rectangle {
  left = 0;
  top = 0;
  right = 0;
  bottom = 0;

  private baseWidth: number;
  private baseHeight: number;
  constructor(baseWidth: number, baseHeight: number);
  constructor(baseWidth: number, baseHeight: number, rect: Rect);
  constructor(baseWidth: number, baseHeight: number, rect?: Rect) {
    if (rect) {
      this.left = rect.left;
      this.right = rect.right;
      this.top = rect.top;
      this.bottom = rect.bottom;
    }

    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;
  }

  get width() {
    return this.right - this.left;
  }

  get height() {
    return this.bottom - this.top;
  }

  convert(targetViewport: Viewport): Rect {
    const widthRatio = targetViewport.width / this.baseWidth;
    const heightRatio = targetViewport.height / this.baseHeight;

    return {
      left: this.left * widthRatio,
      right: this.right * widthRatio,
      top: this.top * heightRatio,
      bottom: this.bottom * heightRatio,
    };
  }
}
