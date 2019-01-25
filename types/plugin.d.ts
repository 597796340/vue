import { Vue as _Vue } from "./vue";

/**
 * 定义插件方法
 */
export type PluginFunction<T> = (Vue: typeof _Vue, options?: T) => void;

/**
 * 定义插件对象
 */
export interface PluginObject<T> {
  install: PluginFunction<T>;
  [key: string]: any;
}
