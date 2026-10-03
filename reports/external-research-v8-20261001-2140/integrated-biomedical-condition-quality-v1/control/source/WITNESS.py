from decimal import Decimal as D
import json

def extents(shape, scale, offset):
    return [[D(str(t)), D(str(t)) + D(str(n))*D(str(s))] for n,s,t in zip(shape,scale,offset)]

image = extents([512,512], [0.5,0.4], [10,2.5])
label = extents([131,256], [1,0.8], [10,102.5])
gaps = [[abs(a-b) for a,b in zip(x,y)] for x,y in zip(image,label)]
epsilon = [D('0.5')*max(D(str(a)),D(str(b))) for a,b in zip([0.5,0.4],[1,0.8])]
old_admits = all(g[1] <= e for g,e in zip(gaps,epsilon))
new_admits = all(max(g) <= e for g,e in zip(gaps,epsilon))
# A permitted multiscales-level scale followed by translation.
i = D(50); s1=D('0.8'); s0=D('0.4'); t=D('2.5'); S=D(3); T=D(7)
p = (i*s1+t)*S+T
literal_inverse=(p-t)/s0
composed_inverse=((p-T)/S-t)/s0
forward_literal=(literal_inverse*s0+t)*S+T
forward_correct=(composed_inverse*s0+t)*S+T
result = {
  'V13_axes_y_x': {'image':image,'label':label,'gaps_start_end':gaps,'epsilon':epsilon,'old_far_endpoint_rule_admits':old_admits,'new_two_endpoint_rule_admits':new_admits},
  'global_composition_switch': {'global_scale_x':S,'global_translation_x':T,'level1_index_x':i,'physical_x':p,'final_line109_literal_level0_index':literal_inverse,'correct_level0_index':composed_inverse,'physical_after_literal_switch':forward_literal,'physical_after_correct_switch':forward_correct},
  'execution_kind':'Evaluator-owned decimal arithmetic only; no candidate implementation or upstream runtime test'
}
assert not old_admits and not new_admits
assert literal_inverse != composed_inverse
assert forward_correct == p and forward_literal != p
print(json.dumps(result,indent=2,default=str))
