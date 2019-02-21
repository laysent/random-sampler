class Component<T> {
  public element: T;
  public key: number;
  constructor(element: T, key: number) {
    this.element = element;
    this.key = key;
  }
}

export default Component;
