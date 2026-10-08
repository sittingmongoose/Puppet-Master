"""Bounded independent review checks. Never executes either frozen witness or GDAL.

Exact rational Gaussian elimination supplies inverse and rank controls independently
of the candidate adjugate. Decimal-intended and binary64-input domains are separate.
Floating formula diagnostics corroborate receipt numbers only, not oracle truth.
"""
from pathlib import Path
from fractions import Fraction as F
from datetime import datetime, timezone
import hashlib
import json
import math

ROOT = Path(__file__).resolve().parent
START = datetime.now(timezone.utc).isoformat()
MAP = json.loads((ROOT / 'INPUT_MAP.json').read_text())

def exact(v, binary=False):
    return F(v) if binary else F(str(v))

def forward(gt, point, binary=False):
    z = [exact(v, binary) for v in gt]
    q = [F(1), *(exact(v, binary) for v in point)]
    return [sum(a*b for a,b in zip(row,q)) for row in
            ([z[0],z[1],z[2]], [z[3],z[4],z[5]])]

def solve(gt, world, binary=False):
    z = [exact(v,binary) for v in gt]
    m = [[z[1],z[2],exact(world[0],binary)-z[0]],
         [z[4],z[5],exact(world[1],binary)-z[3]]]
    # Gauss-Jordan row reduction, deliberately no adjugate formula.
    for col in range(2):
        pivot = next((i for i in range(col,2) if m[i][col]), None)
        if pivot is None:
            return None
        m[col],m[pivot] = m[pivot],m[col]
        d = m[col][col]
        m[col] = [v/d for v in m[col]]
        for row in range(2):
            if row != col:
                d = m[row][col]
                m[row] = [a-d*b for a,b in zip(m[row],m[col])]
    return [m[0][2],m[1][2]]

def lu_det(gt):
    a,b,c,d = (exact(gt[i]) for i in (1,2,4,5))
    sign = 1
    if not a:
        a,b,c,d = c,d,a,b
        sign = -1
    return F(0) if not a else sign*a*(d-c/a*b)

def fwd_float(gt,p,l):
    return gt[0]+p*gt[1]+l*gt[2],gt[3]+p*gt[4]+l*gt[5]

def inv_float(gt,x,y):
    d = gt[1]*gt[5]-gt[2]*gt[4]
    if d == 0:
        return None
    return (gt[5]*(x-gt[0])-gt[2]*(y-gt[3]))/d,(-gt[4]*(x-gt[0])+gt[1]*(y-gt[3]))/d

def ratio(gt):
    d = gt[1]*gt[5]-gt[2]*gt[4]
    s = abs(gt[1]*gt[5])+abs(gt[2]*gt[4])
    return d,s,abs(d)/s if s else 0.0

def strings(xs):
    return None if xs is None else [str(x) for x in xs]

result = {'check_started_utc':START,
          'method':'Exact rational homogeneous forward; independent Gauss-Jordan inverse; LU determinant; separate binary64 diagnostics. No candidate or downloaded source execution.',
          'input_integrity':[], 'outputs':{}, 'fixture_geometry':{}, 'counterexamples':{}}
seed = json.loads(Path(MAP['common_untrusted_seed']['fixtures.json']).read_text())
gts = {v['id']:v['gt'] for v in seed['geotransforms']}
for entry in MAP['primary_sources']:
    h = hashlib.sha256(Path(entry['path']).read_bytes()).hexdigest()
    result['input_integrity'].append({'path':entry['path'],'sha256':h,'matches_map':h==entry['sha256']})
for output in MAP['outputs']:
    label = output['label']
    for name, entry in output['artifacts'].items():
        h = hashlib.sha256(Path(entry['path']).read_bytes()).hexdigest()
        result['input_integrity'].append({'label':label,'artifact':name,'path':entry['path'],'sha256':h,'matches_map':h==entry['sha256']})
    data = json.loads(Path(output['artifacts']['witness-input.json']['path']).read_text())
    receipt = json.loads(Path(output['artifacts']['witness-receipt.json']['path']).read_text())
    supplied = data['geotransforms'] if label == 'Output1' else data['fixtures']
    fixture_match = {v['id']:v['gt'] for v in supplied} == gts
    queries = data['pixel_queries'] if label == 'Output1' else data['query_points']
    points = []
    if label == 'Output1':
        for i,v in enumerate(data['hand_computed_forward_expectations']):
            points.append({'id':f'forward_{i}','fixture':v['gt_id'],'op':'fwd','arg':[v['pixel'],v['line']],'expect':v['expected_xy'],'tol':None})
        for i,v in enumerate(data['hand_computed_inverse_expectations']):
            points.append({'id':f'inverse_{i}','fixture':v['gt_id'],'op':'inv','arg':v['world_xy'],'expect':v['expected_pixel_line'],'tol':None})
    else:
        points = data['correct_controls']['hand_points']
    checks = []
    for p in points:
        gt = gts[p['fixture']]
        decimal = forward(gt,p['arg']) if p['op']=='fwd' else solve(gt,p['arg'])
        binary = forward(gt,p['arg'],True) if p['op']=='fwd' else solve(gt,p['arg'],True)
        ex = [exact(v) for v in p['expect']]
        error = max(abs(a-b) for a,b in zip(binary,ex))
        tol = p['tol'] if p['tol'] is not None else max(1e-12,1e-12*max(abs(float(v)) for v in ex))
        checks.append({'id':p['id'],'op':p['op'],'fixture':p['fixture'],'exact_decimal_result':strings(decimal),'expected':p['expect'],'decimal_expected_exact':decimal==ex,'exact_binary_input_error':float(error),'comparison_tolerance':tol,'binary_error_within_tolerance':float(error)<=tol})
    stdout = json.loads(receipt['stdout'])
    result['outputs'][label] = {'fixture_values_match_common_input':fixture_match,
        'queries_match_common_input':queries==seed['pixel_queries'],
        'receipt_code_hash_matches':receipt['code_sha256']==output['artifacts']['witness.py']['sha256'],
        'receipt_input_hash_matches':receipt['input_sha256']==output['artifacts']['witness-input.json']['sha256'],
        'receipt_elapsed_matches_timestamps_within_0_001s':abs((datetime.fromisoformat(receipt['ended_at'])-datetime.fromisoformat(receipt['started_at'])).total_seconds()-receipt['elapsed_seconds'])<0.001,
        'point_counts':{'forward':sum(p['op']=='fwd' for p in points),'inverse':sum(p['op']=='inv' for p in points)},
        'independent_point_checks':checks,'receipt_stdout':stdout,
        'original_witness_reexecuted':False}
for fid,gt in gts.items():
    a,b,c,d = (exact(gt[i]) for i in (1,2,4,5))
    det = lu_det(gt)
    denom = abs(a*d)+abs(b*c)
    r = abs(det)/denom if denom else F(0)
    result['fixture_geometry'][fid] = {'lu_determinant_exact':str(det),'ratio_denominator_exact':str(denom),'ratio_exact':str(r),'ratio_float':float(r),'column_dot_exact':str(a*b+c*d),'column_squared_norms':strings([a*a+c*c,b*b+d*d]),'frobenius_condition':float((a*a+b*b+c*c+d*d)/abs(det)) if det else None,'unique_inverse_at_origin':solve(gt,[gt[0],gt[3]]) is not None}

# Independently validate all intentional wrong models at their actual probes.
wrong = {}
for fid in ['identity_north_up','rotated']:
    wrong['W1_'+fid] = {'corner':strings(forward(gts[fid],[0,0])),'center':strings(forward(gts[fid],[.5,.5]))}
for fid in ['rotated','sheared','identity_north_up','north_up_meters','geographic_degrees']:
    gt = gts[fid]
    transposed = [gt[0],gt[1],gt[4],gt[3],gt[2],gt[5]]
    pt = [4.25,2.75]
    wrong['W2_'+fid] = {'correct':strings(forward(gt,pt)),'transposed':strings(forward(transposed,pt)),'different':forward(gt,pt)!=forward(transposed,pt)}
gt = gts['rotated']; t = [gt[0],gt[1],gt[4],gt[3],gt[2],gt[5]]
wrong['W2_inverse'] = {'correct_gaussian':strings(solve(gt,[4,3])),'transposed_gaussian':strings(solve(t,[4,3]))}
for fid,pt in [('rotated',[1,2]),('sheared',[4,3])]:
    gt=gts[fid]; north=[gt[0],gt[1],0,gt[3],0,gt[5]]
    wrong['W3_'+fid]={'correct':strings(forward(gt,pt)),'north_up':strings(forward(north,pt))}
max_rt1=max_rt4=max_translation=0.0
max_half=0.0
for gt in gts.values():
    t=[gt[0],gt[1],gt[4],gt[3],gt[2],gt[5]]
    shifted=[gt[0]+17,gt[1],gt[2],gt[3]-6,gt[4],gt[5]]
    for q in seed['pixel_queries']:
        p,l=q['pixel'],q['line']
        xy=fwd_float(gt,p,l); back=inv_float(gt,*xy)
        if back is not None:
            max_rt1=max(max_rt1,abs(back[0]-p),abs(back[1]-l))
        xy=fwd_float(t,p,l); back=inv_float(t,*xy)
        if back is not None:
            xy2=fwd_float(t,*back)
            max_rt4=max(max_rt4,*(abs(a-b) for a,b in zip(xy,xy2)))
        orig=fwd_float(gt,p,l); shift=fwd_float(shifted,p,l)
        max_translation=max(max_translation,abs(shift[0]-orig[0]-17),abs(shift[1]-orig[1]+6))
    corner=fwd_float(gt,0,0); center=fwd_float(gt,.5,.5)
    max_half=max(max_half,abs(center[0]-corner[0]-.5*(gt[1]+gt[2])),abs(center[1]-corner[1]-.5*(gt[4]+gt[5])))
result['wrong_control_independent_checks']=wrong
result['float_receipt_diagnostics']={'Output1_pixel_roundtrip_max':max_rt1,'Output2_wrong_pair_world_roundtrip_max':max_rt4,'translation_max_error':max_translation,'half_pixel_identity_max_error':max_half,'oracle_status':'diagnostics only; independent rational checks above govern truth'}

ce=result['counterexamples']
anis=[0,1,0,0,0,1e-12]
ce['C01_ratio_not_condition_number']={'gt':anis,'ratio':ratio(anis)[2],'condition_2_exact':1e12,'inverse_world_0_1e_minus_12':strings(solve(anis,[0,1e-12])),'inverse_world_0_2e_minus_12':strings(solve(anis,[0,2e-12])),'consequence':'r=1 accepts an anisotropic block while an absolute Y perturbation of 1e-12 changes line by 1 pixel.'}
offset=[1e16,1,0,0,0,-1]
ce['C02_origin_rounding']={'gt':offset,'ratio':ratio(offset)[2],'float_corner':fwd_float(offset,0,0),'float_point':fwd_float(offset,.5,0),'exact_point':strings(forward(offset,[.5,0])),'float_recovered_pixel':inv_float(offset,*fwd_float(offset,.5,0))}
small=[0,1e-200,0,0,0,-1e-200]
large=[0,1e200,0,0,0,-1e200]
ce['C03_underflow']={'gt':small,'float_det':ratio(small)[0],'exact_nonzero_lu_det':str(lu_det(small)),'float_inverse':inv_float(small,5e-201,-5e-201),'independent_inverse':strings(solve(small,[5e-201,-5e-201])),'GDAL_diagonal_branch_inverts_without_determinant':True}
ce['C04_overflow']={'gt':large,'float_det':str(ratio(large)[0]),'float_ratio':str(ratio(large)[2]),'float_inverse':list(map(str,inv_float(large,5e199,-5e199))),'independent_inverse':strings(solve(large,[5e199,-5e199]))}
cancel=[10,1,-1,20,1,-1]
ce['C05_nonconstant_corner_center_collision']={'gt':cancel,'nonconstant':True,'corner':strings(forward(cancel,[0,0])),'center':strings(forward(cancel,[.5,.5])),'another_point':strings(forward(cancel,[1,0]))}
orth=[0,2,0,0,0,3]
ce['C06_orthogonal_not_transpose_over_det']={'gt':orth,'column_dot':0,'det':6,'true_inverse_world_1_1':strings(solve(orth,[1,1])),'transpose_over_det_result':['1/3','1/2'],'Output1_code_common_norm_denominator_result':['1/2','3/4']}
almost=[0,1,1,0,1,1.000000000002]
ce['C07_release_vs_policy']={'gt':almost,'float_det':ratio(almost)[0],'ratio':ratio(almost)[2],'candidate_exact_zero_inverse_available':inv_float(almost,1,1) is not None,'GDAL_general_branch_rejects':abs(ratio(almost)[0])<=1e-10*max(abs(almost[i]) for i in (1,2,4,5))**2,'note':'Selected release rejects this nonzero determinant. It is also below both proposed margin thresholds; candidate inv function itself lacks that policy.'}
result['check_finished_utc']=datetime.now(timezone.utc).isoformat()
result['all_frozen_hashes_match']=all(x['matches_map'] for x in result['input_integrity'])
result['all_independent_point_constants_correct']=all(p['decimal_expected_exact'] and p['binary_error_within_tolerance'] for out in result['outputs'].values() for p in out['independent_point_checks'])
(ROOT/'review-checks.json').write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
print(json.dumps({'started':START,'finished':result['check_finished_utc'],'all_frozen_hashes_match':result['all_frozen_hashes_match'],'all_independent_point_constants_correct':result['all_independent_point_constants_correct'],'point_counts':{k:v['point_counts'] for k,v in result['outputs'].items()},'sheared_geometry':result['fixture_geometry']['sheared'],'receipt_diagnostics':result['float_receipt_diagnostics'],'counterexamples':ce},indent=2,allow_nan=False))
