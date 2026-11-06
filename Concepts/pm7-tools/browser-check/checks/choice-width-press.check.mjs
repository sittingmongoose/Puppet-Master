// Bounded medium-width sample; the main guard supplies ten looks x three paths.
import press from './choice-press-edges.check.mjs';
import { WIDTHS } from '../browser-check.config.mjs';
export default async function(t) {
 const saved={...t.args};
 try {
  for(const width of WIDTHS.filter(w=>w!==1920)) {
   Object.assign(t.args,{width,height:1080,look:'friendly-light,glass-light',motion:'no-preference',screen:'where,look,nas-find',first:1,onePx:1});
   await press(t);
  }
 } finally {
  Object.keys(t.args).forEach(k=>delete t.args[k]);Object.assign(t.args,saved);
 }
}
