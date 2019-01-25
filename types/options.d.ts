import { Vue, CreateElement, CombinedVueInstance } from "./vue";
import { VNode, VNodeData, VNodeDirective, ScopedSlot } from "./vnode";

type Constructor = {
  new (...args: any[]): any;
}

// we don't support infer props in async component
// N.B. ComponentOptions<V> is contravariant, the default generic should be bottom type
export type Component<Data=DefaultData<never>, Methods=DefaultMethods<never>, Computed=DefaultComputed, Props=DefaultProps> =
  | typeof Vue
  | FunctionalComponentOptions<Props>
  | ComponentOptions<never, Data, Methods, Computed, Props>

interface EsModuleComponent {
  default: Component
}

export type AsyncComponent<Data=DefaultData<never>, Methods=DefaultMethods<never>, Computed=DefaultComputed, Props=DefaultProps>
  = AsyncComponentPromise<Data, Methods, Computed, Props>
  | AsyncComponentFactory<Data, Methods, Computed, Props>

export type AsyncComponentPromise<Data=DefaultData<never>, Methods=DefaultMethods<never>, Computed=DefaultComputed, Props=DefaultProps> = (
  resolve: (component: Component<Data, Methods, Computed, Props>) => void,
  reject: (reason?: any) => void
) => Promise<Component | EsModuleComponent> | void;

export type AsyncComponentFactory<Data=DefaultData<never>, Methods=DefaultMethods<never>, Computed=DefaultComputed, Props=DefaultProps> = () => {
  component: AsyncComponentPromise<Data, Methods, Computed, Props>;
  loading?: Component | EsModuleComponent;
  error?: Component | EsModuleComponent;
  delay?: number;
  timeout?: number;
}

/**
 * When the `Computed` type parameter on `ComponentOptions` is inferred,
 * it should have a property with the return type of every get-accessor.
 * Since there isn't a way to query for the return type of a function, we allow TypeScript
 * to infer from the shape of `Accessors<Computed>` and work backwards.
 */
export type Accessors<T> = {
  [K in keyof T]: (() => T[K]) | ComputedOptions<T[K]>
}

type DataDef<Data, Props, V> = Data | ((this: Readonly<Props> & V) => Data)
/**
 * This type should be used when an array of strings is used for a component's `props` value.
 */
export type ThisTypedComponentOptionsWithArrayProps<V extends Vue, Data, Methods, Computed, PropNames extends string> =
  object &
  ComponentOptions<V, DataDef<Data, Record<PropNames, any>, V>, Methods, Computed, PropNames[], Record<PropNames, any>> &
  ThisType<CombinedVueInstance<V, Data, Methods, Computed, Readonly<Record<PropNames, any>>>>;

/**
 * This type should be used when an object mapped to `PropOptions` is used for a component's `props` value.
 */
export type ThisTypedComponentOptionsWithRecordProps<V extends Vue, Data, Methods, Computed, Props> =
  object &
  ComponentOptions<V, DataDef<Data, Props, V>, Methods, Computed, RecordPropsDefinition<Props>, Props> &
  ThisType<CombinedVueInstance<V, Data, Methods, Computed, Readonly<Props>>>;

type DefaultData<V> =  object | ((this: V) => object);
type DefaultProps = Record<string, any>;
type DefaultMethods<V> =  { [key: string]: (this: V, ...args: any[]) => any };
type DefaultComputed = { [key: string]: any };
export interface ComponentOptions<
  V extends Vue,
  Data=DefaultData<V>,
  Methods=DefaultMethods<V>,
  Computed=DefaultComputed,
  PropsDef=PropsDefinition<DefaultProps>,
  Props=DefaultProps> {
  // ---------------------------------- 选项 / 数据 ----------------------------------
  /**
   * Vue 实例的数据对象
   * Vue 将会递归将 data 的属性转换为 getter/setter，从而让 data 的属性能够响应数据变化
   * vm.$data === data
   */
  data?: Data;
  /**
   * props 可以是数组或对象，用于接收来自父组件的数据
   */
  props?: PropsDef;
  /**
   * 创建实例时传递 props
   * 主要作用是方便测试
   */
  propsData?: object;
  /**
   * 计算属性
   */
  computed?: Accessors<Computed>;
  /**
   * methods 将被混入到 Vue 实例中
   * 直接通过 VM 实例访问这些方法
   */
  methods?: Methods;
  /**
   * 监控值变化，并执行回调函数
   */
  watch?: Record<string, WatchOptionsWithHandler<any> | WatchHandler<any> | string>;

  el?: Element | string;
  template?: string;
  // hack is for functional component type inference, should not be used in user code
  render?(createElement: CreateElement, hack: RenderContext<Props>): VNode;
  renderError?(createElement: CreateElement, err: Error): VNode;
  staticRenderFns?: ((createElement: CreateElement) => VNode)[];

  beforeCreate?(this: V): void;
  created?(): void;
  beforeDestroy?(): void;
  destroyed?(): void;
  beforeMount?(): void;
  mounted?(): void;
  beforeUpdate?(): void;
  updated?(): void;
  activated?(): void;
  deactivated?(): void;
  errorCaptured?(err: Error, vm: Vue, info: string): boolean | void;
  serverPrefetch?(this: V): Promise<void>;

  directives?: { [key: string]: DirectiveFunction | DirectiveOptions };
  components?: { [key: string]: Component<any, any, any, any> | AsyncComponent<any, any, any, any> };
  transitions?: { [key: string]: object };
  filters?: { [key: string]: Function };

  provide?: object | (() => object);
  inject?: InjectOptions;

  model?: {
    prop?: string;
    event?: string;
  };

  parent?: Vue;
  mixins?: (ComponentOptions<Vue> | typeof Vue)[];
  name?: string;
  // TODO: support properly inferred 'extends'
  extends?: ComponentOptions<Vue> | typeof Vue;
  delimiters?: [string, string];
  comments?: boolean;
  inheritAttrs?: boolean;
}

export interface FunctionalComponentOptions<Props = DefaultProps, PropDefs = PropsDefinition<Props>> {
  name?: string;
  props?: PropDefs;
  model?: {
    prop?: string;
    event?: string;
  };
  inject?: InjectOptions;
  functional: boolean;
  render?(this: undefined, createElement: CreateElement, context: RenderContext<Props>): VNode | VNode[];
}

export interface RenderContext<Props=DefaultProps> {
  props: Props;
  children: VNode[];
  slots(): any;
  data: VNodeData;
  parent: Vue;
  listeners: { [key: string]: Function | Function[] };
  scopedSlots: { [key: string]: ScopedSlot };
  injections: any
}

export type Prop<T> = { (): T } | { new(...args: any[]): T & object }

export type PropType<T> = Prop<T> | Prop<T>[];

export type PropValidator<T> = PropOptions<T> | PropType<T>;

export interface PropOptions<T=any> {
  type?: PropType<T>;
  required?: boolean;
  default?: T | null | undefined | (() => T | null | undefined);
  validator?(value: T): boolean;
}

export type RecordPropsDefinition<T> = {
  [K in keyof T]: PropValidator<T[K]>
}
export type ArrayPropsDefinition<T> = (keyof T)[];
export type PropsDefinition<T> = ArrayPropsDefinition<T> | RecordPropsDefinition<T>;

export interface ComputedOptions<T> {
  get?(): T;
  set?(value: T): void;
  cache?: boolean;
}

export type WatchHandler<T> = (val: T, oldVal: T) => void;

export interface WatchOptions {
  deep?: boolean;
  immediate?: boolean;
}

export interface WatchOptionsWithHandler<T> extends WatchOptions {
  handler: WatchHandler<T>;
}

export interface DirectiveBinding extends Readonly<VNodeDirective> {
  readonly modifiers: { [key: string]: boolean };
}

export type DirectiveFunction = (
  el: HTMLElement,
  binding: DirectiveBinding,
  vnode: VNode,
  oldVnode: VNode
) => void;

export interface DirectiveOptions {
  bind?: DirectiveFunction;
  inserted?: DirectiveFunction;
  update?: DirectiveFunction;
  componentUpdated?: DirectiveFunction;
  unbind?: DirectiveFunction;
}

export type InjectKey = string | symbol;

export type InjectOptions = {
  [key: string]: InjectKey | { from?: InjectKey, default?: any }
} | string[];
