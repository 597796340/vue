import {
  Component,
  AsyncComponent,
  ComponentOptions,
  FunctionalComponentOptions,
  WatchOptionsWithHandler,
  WatchHandler,
  DirectiveOptions,
  DirectiveFunction,
  RecordPropsDefinition,
  ThisTypedComponentOptionsWithArrayProps,
  ThisTypedComponentOptionsWithRecordProps,
  WatchOptions,
} from "./options";
import { VNode, VNodeData, VNodeChildren, NormalizedScopedSlot } from "./vnode";
import { PluginFunction, PluginObject } from "./plugin";

export interface CreateElement {
  (tag?: string | Component<any, any, any, any> | AsyncComponent<any, any, any, any> | (() => Component), children?: VNodeChildren): VNode;
  (tag?: string | Component<any, any, any, any> | AsyncComponent<any, any, any, any> | (() => Component), data?: VNodeData, children?: VNodeChildren): VNode;
}

export interface Vue {
  // ---------------------------------- 实例属性 ----------------------------------
  /**
   * Vue 实例使用的根 DOM 元素
   */
  readonly $el: Element;
  /**
   * 当前 Vue 实例的初始化选项
   */
  readonly $options: ComponentOptions<Vue>;
  /**
   * 父实例，不一定存在
   */
  readonly $parent: Vue;
  /**
   * 当前组件树的根 Vue 实例。如果当前实例没有父实例，此实例将会是其自己
   */
  readonly $root: Vue;
  /**
   * 当前组件的子组件
   */
  readonly $children: Vue[];
  /**
   * 一个持有注册过 ref 特性的所有 DOM 元素和组件实例对象
   * <base-input ref="usernameInput"></base-input>
   * this.$refs.usernameInput
   */
  readonly $refs: { [key: string]: Vue | Element | Vue[] | Element[] };
  /**
   * 用来访问被插槽分发的内容。每个具名插槽有其相应的属性 this.$slots.header
   */
  readonly $slots: { [key: string]: VNode[] | undefined };
  /**
   * 渲染函数向子组件中传递作用域插槽，用来访问作用域插槽
   */
  readonly $scopedSlots: { [key: string]: NormalizedScopedSlot | undefined };
  /**
   * 当前 Vue 实例是否运行于服务器，用作服务器端渲染
   * Nuxt.js 为开发服务端渲染的 Vue 应用提供了极其便利的开发体验
   */
  readonly $isServer: boolean;
  /**
   * Vue 实例观察的数据对象
   */
  readonly $data: Record<string, any>;
  /**
   * 由父组件传递给子组件，子组件接收到的 props 数据对象
   */
  readonly $props: Record<string, any>;
  /**
   * 直接访问组件中的服务器端渲染上下文
   */
  readonly $ssrContext: any;
  /**
   * vue dom 节点
   */
  readonly $vnode: VNode;
  /**
   * 存放没有被子组件继承的的数据对象，即未通过 props 的方式向子组件传递的数据
   * 需要设置 inheritAttrs = true，父组件子元素设置v-bind="$attrs" 传入内部组件
   * <child v-bind="$attrs"></child>
   * inheritAttrs + $attrs + $listeners 父子组件数据传递
   */
  readonly $attrs: Record<string, string>;
  /**
   * 子组件可以触发父组件的事件
   * 父组件子元素通过 v-on="$listeners" 传入内部组件
   * <child v-on="$listeners"></child>
   */
  readonly $listeners: Record<string, Function | Function[]>;

  // ---------------------------------- 实例方法 / 生命周期 ----------------------------------
  /**
   * 手动地挂载一个未挂载的实例
   * @param elementOrSelector 实例名或元素
   * @param hydrating
   * new MyComponent().$mount('#app')
   */
  $mount(elementOrSelector?: Element | string, hydrating?: boolean): this;

  /**
   * 迫使 Vue 实例重新渲染，它仅仅影响实例本身和插入插槽内容的子组件，而不是所有子组件
   */
  $forceUpdate(): void;

  /**
   * 将回调延迟到下次 DOM 更新循环之后执行
   * 在修改数据之后立即使用它，然后等待 DOM 更新
   * 它跟全局方法 Vue.nextTick 一样，不同的是回调函数中的 this 自动绑定到调用它的实例上
   * @param callback 回调函数
   */
  $nextTick(callback: (this: this) => void): void;

  /**
   * 将回调延迟到下次 DOM 更新循环之后执行
   * 返回一个 Promise
   */
  $nextTick(): Promise<void>;

  /**
   * 完全销毁一个实例
   * 清理它与其它实例的连接，解绑它的全部指令及事件监听器
   * 触发 beforeDestroy 和 destroyed 的钩子
   */
  $destroy(): void;

  // ---------------------------------- 实例方法 / 数据 ----------------------------------
  /**
   * 全局 Vue.set 的别名
   */
  $set: typeof Vue.set;

  /**
   * 全局 Vue.delete 的别名
   */
  $delete: typeof Vue.delete;

  /**
   * 观察 Vue 实例变化的一个表达式或计算属性函数。回调函数得到的参数为新值和旧值
   * @param expOrFn 表达式，监督的键路径
   * @param callback 回调函数
   * @param options 配置对象
   */
  $watch(
    expOrFn: string,
    callback: (this: this, n: any, o: any) => void,
    options?: WatchOptions
  ): (() => void);

  /**
   * 观察 Vue 实例变化的一个表达式或计算属性函数。回调函数得到的参数为新值和旧值
   * @param expOrFn 实例对象
   * @param callback 回调函数
   * @param options 配置对象
   */
  $watch<T>(
    expOrFn: (this: this) => T,
    callback: (this: this, n: T, o: T) => void,
    options?: WatchOptions
  ): (() => void);

  // ---------------------------------- 实例方法/事件 ----------------------------------
  /**
   * 监听当前实例上的自定义事件。事件可以由vm.$emit触发
   * @param event 事件名
   * @param callback 事件触发回调函数，回调函数会接收所有传入事件触发函数的额外参数
   */
  $on(event: string | string[], callback: Function): this;


  /**
   * 监听一个自定义事件，但是只触发一次，在第一次触发之后移除监听器
   * @param event 事件名
   * @param callback 事件触发回调函数，回调函数会接收所有传入事件触发函数的额外参数
   */
  $once(event: string | string[], callback: Function): this;


  /**
   * 移除自定义事件监听器。
   * 如果没有提供参数，则移除所有的事件监听器；
   * 如果只提供了事件，则移除该事件所有的监听器；
   * 如果同时提供了事件与回调，则只移除这个回调的监听器
   * @param event 事件名
   * @param callback 事件移除后的回调函数
   */
  $off(event?: string | string[], callback?: Function): this;

  /**
   * 触发当前实例上的事件。附加参数都会传给监听器回调
   * @param event 事件名
   * @param args 传入参数
   */
  $emit(event: string, ...args: any[]): this;

  $createElement: CreateElement;
}

/**
 * vue 实例包括的综合属性
 * Data，Methods，Computed，Props，Instance
 */
export type CombinedVueInstance<Instance extends Vue, Data, Methods, Computed, Props> =  Data & Methods & Computed & Props & Instance;

/**
 * 对 vue 实例进行拓展
 */
export type ExtendedVue<Instance extends Vue, Data, Methods, Computed, Props> = VueConstructor<CombinedVueInstance<Instance, Data, Methods, Computed, Props> & Vue>;

/**
 * 对 vue 实例进行拓展
 */
export interface VueConfiguration {
  /**
   * 取消 Vue 所有的日志与警告
   */
  silent: boolean;

  /**
   * 自定义选项合并策略，覆盖已有值，也可自定义逻辑合并
   */
  optionMergeStrategies: any;

  /**
   * 配置是否允许 vue-devtools 检查代码，开发版本默认为 true，生产版本默认为 false
   */
  devtools: boolean;

  /**
   * 设置为 false 以阻止 vue 在启动时生成生产提示
   */
  productionTip: boolean;

  /**
   * 设置为 true 以在浏览器开发工具的性能/时间线面板中启用对组件初始化、编译、渲染和打补丁的性能追踪
   */
  performance: boolean;

  /**
   * 指定组件的渲染和观察期间未捕获错误的处理函数
   * @param err 错误对象
   * @param vm Vue 实例
   * @param info Vue 特定的错误信息
   */
  errorHandler(err: Error, vm: Vue, info: string): void;

  /**
   * 运行时产生的警告赋予一个自定义处理函数
   * @param msg 告警信息
   * @param vm Vue 实例
   * @param trace 组件的继承关系追踪
   */
  warnHandler(msg: string, vm: Vue, trace: string): void;

  /**
   * 忽略在 Vue 之外的自定义元素
   */
  ignoredElements: (string | RegExp)[];

  /**
   * 自定义键位别名
   */
  keyCodes: { [key: string]: number | number[] };
  async: boolean;
}

export interface VueConstructor<V extends Vue = Vue> {
  new <Data = object, Methods = object, Computed = object, PropNames extends string = never>(options?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropNames>): CombinedVueInstance<V, Data, Methods, Computed, Record<PropNames, any>>;
  // ideally, the return type should just contain Props, not Record<keyof Props, any>. But TS requires to have Base constructors with the same return type.
  new <Data = object, Methods = object, Computed = object, Props = object>(options?: ThisTypedComponentOptionsWithRecordProps<V, Data, Methods, Computed, Props>): CombinedVueInstance<V, Data, Methods, Computed, Record<keyof Props, any>>;
  new (options?: ComponentOptions<V>): CombinedVueInstance<V, object, object, object, Record<keyof object, any>>;


  /**
   * 使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象
   * @param options 对象或者组件配置
   */
  extend<Data, Methods, Computed, PropNames extends string = never>(options?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropNames>): ExtendedVue<V, Data, Methods, Computed, Record<PropNames, any>>;
  extend<Data, Methods, Computed, Props>(options?: ThisTypedComponentOptionsWithRecordProps<V, Data, Methods, Computed, Props>): ExtendedVue<V, Data, Methods, Computed, Props>;
  extend<PropNames extends string = never>(definition: FunctionalComponentOptions<Record<PropNames, any>, PropNames[]>): ExtendedVue<V, {}, {}, {}, Record<PropNames, any>>;
  extend<Props>(definition: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>): ExtendedVue<V, {}, {}, {}, Props>;
  extend(options?: ComponentOptions<V>): ExtendedVue<V, {}, {}, {}, {}>;

  /**
   * 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM
   * @param callback 更新DOM后执行的回调函数
   * @param context DOM对象
   */
  nextTick<T>(callback: (this: T) => void, context?: T): void;

  /**
   * 支持 Promise 操作
   */
  nextTick(): Promise<void>

  /**
   * 向响应式对象上添加新属性，并且会触发视图更新
   * @param object 响应式对象
   * @param key 新属性名
   * @param value 新属性值
   */
  set<T>(object: object, key: string | number, value: T): T;

  /**
   * 给数组添加新的元素，并且会触发视图更新
   * @param array 传入数组
   * @param key 数组元素下标
   * @param value 元素值
   */
  set<T>(array: T[], key: number, value: T): T;

  /**
   * 删除对象元素，与 set 相对，同时也会触发视图更新
   * @param object 响应式对象
   * @param key 对象中包含的属性名
   */
  delete(object: object, key: string | number): void;

   /**
   * 删除数组元素，与 set 相对，同时也会触发视图更新
   * @param array 传入数组
   * @param key 数组元素下标
   */
  delete<T>(array: T[], key: number): void;

  /**
   * 自定义指令，然后元素可以使用v-x，x为注册的指令id
   * @param id 自定义指令的id
   * @param definition DirectiveOptions: {bind?, inserted?, update?, componentUpdated?, unbind?}对以上事件进行定义
   *                   DirectiveFunction: {el, binding, vnode, oldVnode}对以上属性进行定义
   */
  directive(
    id: string,
    definition?: DirectiveOptions | DirectiveFunction
  ): DirectiveOptions;

  /**
   * 注册或获取全局过滤器
   * @param id 自定义的过滤器id
   * @param definition 过滤后的操作函数
   */
  filter(id: string, definition?: Function): Function;

  /**
   * 注册或获取全局组件
   * @param id 自定义的组件id
   */
  component(id: string): VueConstructor;

  /**
   * 注册或获取全局组件
   * @param id 自定义的组件id
   * @param constructor 组件初始化构造函数
   */
  component<VC extends VueConstructor>(id: string, constructor: VC): VC;

  /**
   * 注册或获取全局组件
   * @param id 自定义的组件id
   * @param definition 自定义组件设置的异步加载组件
   */
  component<Data, Methods, Computed, Props>(id: string, definition: AsyncComponent<Data, Methods, Computed, Props>): ExtendedVue<V, Data, Methods, Computed, Props>;

  /**
   * 注册或获取全局组件
   * @param id 自定义的组件id
   * @param definition 使用 array 作为 props 的值的组件设置
   *                   props: ['prop1', 'prop2'],
   */
  component<Data, Methods, Computed, PropNames extends string = never>(id: string, definition?: ThisTypedComponentOptionsWithArrayProps<V, Data, Methods, Computed, PropNames>): ExtendedVue<V, Data, Methods, Computed, Record<PropNames, any>>;

  /**
   * 注册或获取全局组件
   * @param id 自定义的组件id
   * @param definition 使用 object 作为 props 的值的组件设置
   *                   props: { prop1: { type: Number } }
   */
  component<Data, Methods, Computed, Props>(id: string, definition?: ThisTypedComponentOptionsWithRecordProps<V, Data, Methods, Computed, Props>): ExtendedVue<V, Data, Methods, Computed, Props>;
  component<PropNames extends string>(id: string, definition: FunctionalComponentOptions<Record<PropNames, any>, PropNames[]>): ExtendedVue<V, {}, {}, {}, Record<PropNames, any>>;
  component<Props>(id: string, definition: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>): ExtendedVue<V, {}, {}, {}, Props>;
  component(id: string, definition?: ComponentOptions<V>): ExtendedVue<V, {}, {}, {}, {}>;

  /**
   * 安装 Vue.js 插件
   * @param plugin 插件对象或者插件方法
   * @param options 定义插件属性
   */
  use<T>(plugin: PluginObject<T> | PluginFunction<T>, options?: T): VueConstructor<V>;

  /**
   * 安装 Vue.js 插件
   * @param plugin 插件对象或者插件方法
   * @param options 传入的一个选项对象
   */
  use(plugin: PluginObject<any> | PluginFunction<any>, ...options: any[]): VueConstructor<V>;

  /**
   * 全局注册一个混入，影响注册之后所有创建的每个 Vue 实例
   * 谨慎使用全局混入对象，因为会影响到每个单独创建的 Vue 实例 (包括第三方模板)。大多数情况下，只应当应用于自定义选项
   * @param mixin 混入对象
   */
  mixin(mixin: VueConstructor | ComponentOptions<Vue>): VueConstructor<V>;

  /**
   * 在 render 函数中编译模板字符串。只在独立构建时有效
   * @param template 渲染的节点字符串
   */
  compile(template: string): {
    /**
     * 渲染函数，执行编译模板
     * @param createElement
     */
    render(createElement: typeof Vue.prototype.$createElement): VNode;
    staticRenderFns: (() => VNode)[];
  };

  observable<T>(obj: T): T;

  /**
   * vue 实例全局配置
   */
  config: VueConfiguration;
  version: string;
}

export const Vue: VueConstructor;
