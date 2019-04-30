import { Vue } from "./vue";

export type ScopedSlot = (props: any) => ScopedSlotReturnValue;
type ScopedSlotReturnValue = VNode | string | boolean | null | undefined | ScopedSlotReturnArray;
interface ScopedSlotReturnArray extends Array<ScopedSlotReturnValue> {}

// Scoped slots are guaranteed to return Array of VNodes starting in 2.6
export type NormalizedScopedSlot = (props: any) => ScopedSlotChildren;
export type ScopedSlotChildren = VNode[] | undefined;

// Relaxed type compatible with $createElement
export type VNodeChildren = VNodeChildrenArrayContents | [ScopedSlot] | string | boolean | null | undefined;
export interface VNodeChildrenArrayContents extends Array<VNodeChildren | VNode> {}

export interface VNode {
  /**
   * 当前节点的标签名
   */
  tag?: string;
  /**
   * 当前节点的数据对象 VNodeData
   */
  data?: VNodeData;
  /**
   * 数组类型，包含了当前节点的子节点
   */
  children?: VNode[];
  /**
   * 当前节点的文本，一般文本节点或注释节点会有该属性
   */
  text?: string;
  /**
   * 当前虚拟节点对应的真实的dom节点
   */
  elm?: Node;
  /**
   * 节点的namespace
   */
  ns?: string;
  /**
   * 编译作用域
   */
  context?: Vue;
  /**
   * 节点的key属性，用于作为节点的标识，有利于patch的优化
   */
  key?: string | number;
  /**
   * 创建组件实例时会用到的选项信息
   */
  componentOptions?: VNodeComponentOptions;
  /**
   * VueComponent 对象
   */
  componentInstance?: Vue;
  /**
   * 指定已创建的实例之父实例，在两者之间建立父子关系
   */
  parent?: VNode;
  /**
   * raw html
   */
  raw?: boolean;
  /**
   * 静态节点的标识
   */
  isStatic?: boolean;
  /**
   *  是否作为根节点插入，被<transition>包裹的节点，该属性的值为false
   */
  isRootInsert: boolean;
  /**
   * 当前节点是否是注释节点
   */
  isComment: boolean;
}

export interface VNodeComponentOptions {
  Ctor: typeof Vue;
  propsData?: object;
  listeners?: object;
  children?: VNode[];
  tag?: string;
}

export interface VNodeData {
  key?: string | number;
  slot?: string;
  scopedSlots?: { [key: string]: ScopedSlot | undefined };
  ref?: string;
  refInFor?: boolean;
  tag?: string;
  staticClass?: string;
  class?: any;
  staticStyle?: { [key: string]: any };
  style?: string | object[] | object;
  props?: { [key: string]: any };
  attrs?: { [key: string]: any };
  domProps?: { [key: string]: any };
  hook?: { [key: string]: Function };
  on?: { [key: string]: Function | Function[] };
  nativeOn?: { [key: string]: Function | Function[] };
  transition?: object;
  show?: boolean;
  inlineTemplate?: {
    render: Function;
    staticRenderFns: Function[];
  };
  directives?: VNodeDirective[];
  keepAlive?: boolean;
}

export interface VNodeDirective {
  name: string;
  value?: any;
  oldValue?: any;
  expression?: any;
  arg?: string;
  oldArg?: string;
  modifiers?: { [key: string]: boolean };
}
