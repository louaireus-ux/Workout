/* ============================================================
   Readiness Board — standalone build.
   Memory: everything lives in localStorage under STORE_KEY, written
   through on every change. Export/import moves it between devices.
   ============================================================ */

const MUSCLES=['chest','shoulders','biceps','triceps','forearms','core','traps','lats','lowerback','glutes','quads','hamstrings','calves'];
const MLABEL={chest:'Chest',shoulders:'Shoulders',biceps:'Biceps',triceps:'Triceps',forearms:'Forearms',core:'Core',traps:'Traps / upper back',lats:'Lats',lowerback:'Lower back',glutes:'Glutes',quads:'Quads',hamstrings:'Hamstrings',calves:'Calves'};

const DEFAULT_PLAN={days:[
 {id:'A',name:'Full Body A',focus:'Squat',exercises:[
   {id:'a1',name:'Back squat',sets:4,reps:'6-10',m:{quads:1,glutes:.6,lowerback:.4,hamstrings:.3,core:.3}},
   {id:'a2',name:'Barbell bench press',sets:4,reps:'6-10',m:{chest:1,triceps:.6,shoulders:.4}},
   {id:'a3',name:'Barbell bent-over row',sets:4,reps:'8-12',m:{lats:1,traps:.6,biceps:.5,lowerback:.4,forearms:.3}},
   {id:'a4',name:'Barbell hip thrust',sets:3,reps:'10-15',m:{glutes:1,hamstrings:.5}},
   {id:'a5',name:'Band lateral raise',sets:3,reps:'15-20',m:{shoulders:1}},
   {id:'a6',name:'Barbell / single-DB curl',sets:3,reps:'10-15',m:{biceps:1,forearms:.5}},
   {id:'a7',name:'Hanging leg raise',sets:3,reps:'10-15',m:{core:1,forearms:.3}}
 ]},
 {id:'B',name:'Full Body B',focus:'Hinge',exercises:[
   {id:'b1',name:'Barbell RDL',sets:4,reps:'6-10',m:{hamstrings:1,glutes:.7,lowerback:.7,forearms:.3}},
   {id:'b2',name:'Barbell overhead press',sets:4,reps:'6-10',m:{shoulders:1,triceps:.6,traps:.3,core:.3}},
   {id:'b3',name:'Pull-up rehab (band / negatives)',sets:4,reps:'3-6',m:{lats:1,biceps:.6,forearms:.5,traps:.4}},
   {id:'b4',name:'Single-arm DB row',sets:3,reps:'8-12',m:{lats:1,traps:.5,biceps:.5,forearms:.3}},
   {id:'b5',name:'Dips (band-assist)',sets:3,reps:'8-12',m:{triceps:1,chest:.7,shoulders:.4}},
   {id:'b6',name:'Band face pull',sets:3,reps:'15-20',m:{shoulders:.7,traps:.7,lats:.3}},
   {id:'b7',name:'Plank / mat core',sets:3,reps:'hold',m:{core:1}}
 ]},
 {id:'C',name:'Full Body C',focus:'Legs + arms',exercises:[
   {id:'c1',name:'Bulgarian split squat',sets:4,reps:'8-12',m:{quads:1,glutes:.8,hamstrings:.4,core:.3}},
   {id:'c2',name:'Incline / floor barbell press',sets:3,reps:'8-12',m:{chest:1,shoulders:.6,triceps:.6}},
   {id:'c3',name:'Single-leg RDL',sets:3,reps:'10-12',m:{hamstrings:1,glutes:.7,lowerback:.5}},
   {id:'c4',name:'Inverted row / pull-up negatives',sets:3,reps:'8-12',m:{lats:1,traps:.5,biceps:.5}},
   {id:'c5',name:'Band lateral raise',sets:3,reps:'15-20',m:{shoulders:1}},
   {id:'c6',name:'Curl + dip superset',sets:3,reps:'rounds',m:{biceps:1,triceps:1,forearms:.4}},
   {id:'c7',name:'Core circuit',sets:3,reps:'—',m:{core:1}}
 ]}
]};

const EX_LIB=[
 {n:'Barbell bench press',rep:'4×6-10',m:{chest:1},e:['barbell','bench']},
 {n:'Incline barbell press',rep:'3×8-12',m:{chest:1},e:['barbell','bench']},
 {n:'Floor press',rep:'3×8-12',m:{chest:1},e:['barbell']},
 {n:'Dips',rep:'3×8-12',m:{chest:.9,triceps:1},e:['dipbar']},
 {n:'Push-up',rep:'3×AMRAP',m:{chest:.9,triceps:.6},e:['bodyweight']},
 {n:'Band chest press',rep:'3×12-20',m:{chest:1},e:['bands']},
 {n:'Barbell overhead press',rep:'4×6-10',m:{shoulders:1},e:['barbell']},
 {n:'Push press',rep:'4×5-8',m:{shoulders:1},e:['barbell']},
 {n:'DB lateral raise',rep:'3×12-20',m:{shoulders:1},e:['dumbbell']},
 {n:'Band lateral raise',rep:'3×15-20',m:{shoulders:1},e:['bands']},
 {n:'Pike push-up',rep:'3×8-12',m:{shoulders:.9},e:['bodyweight']},
 {n:'Barbell curl',rep:'3×8-12',m:{biceps:1},e:['barbell']},
 {n:'Single-DB curl',rep:'3×10-15',m:{biceps:1},e:['dumbbell']},
 {n:'Band curl',rep:'3×12-20',m:{biceps:1},e:['bands']},
 {n:'Chin-up',rep:'3×AMRAP',m:{biceps:1,lats:.8},e:['pullup']},
 {n:'Close-grip bench',rep:'3×8-12',m:{triceps:1},e:['barbell','bench']},
 {n:'Band pushdown',rep:'3×15-20',m:{triceps:1},e:['bands']},
 {n:'Diamond push-up',rep:'3×AMRAP',m:{triceps:.9,chest:.6},e:['bodyweight']},
 {n:'Skullcrusher',rep:'3×8-12',m:{triceps:1},e:['barbell','bench']},
 {n:'Barbell wrist curl',rep:'3×15-20',m:{forearms:1},e:['barbell']},
 {n:'Dead hang',rep:'3×max',m:{forearms:1},e:['pullup']},
 {n:'Farmer carry',rep:'3×40m',m:{forearms:1,traps:.6,core:.5},e:['dumbbell']},
 {n:'Reverse curl',rep:'3×12-15',m:{forearms:1,biceps:.5},e:['barbell']},
 {n:'Barbell row',rep:'4×8-12',m:{lats:1,traps:.6},e:['barbell']},
 {n:'Single-arm DB row',rep:'3×8-12',m:{lats:1,traps:.5},e:['dumbbell']},
 {n:'Inverted row',rep:'3×8-15',m:{lats:1,traps:.5},e:['barbell','rack']},
 {n:'Band pulldown',rep:'3×12-20',m:{lats:1},e:['bands']},
 {n:'Pull-up (or negatives)',rep:'3×3-8',m:{lats:1,biceps:.6},e:['pullup']},
 {n:'Barbell shrug',rep:'3×12-15',m:{traps:1},e:['barbell']},
 {n:'DB shrug',rep:'3×15-20',m:{traps:1},e:['dumbbell']},
 {n:'Band face pull',rep:'3×15-20',m:{traps:.8,shoulders:.7},e:['bands']},
 {n:'Barbell RDL',rep:'4×6-10',m:{hamstrings:1,glutes:.7,lowerback:.7},e:['barbell']},
 {n:'Deadlift',rep:'4×4-6',m:{lowerback:1,hamstrings:.8,glutes:.7,traps:.5},e:['barbell','rack']},
 {n:'Good morning',rep:'3×8-12',m:{lowerback:1,hamstrings:.7},e:['barbell']},
 {n:'Back extension',rep:'3×12-15',m:{lowerback:1,glutes:.5},e:['bench']},
 {n:'Superman',rep:'3×15',m:{lowerback:1},e:['mat']},
 {n:'Barbell hip thrust',rep:'3×10-15',m:{glutes:1,hamstrings:.5},e:['barbell','bench']},
 {n:'Bulgarian split squat',rep:'4×8-12',m:{glutes:.9,quads:1},e:['dumbbell','bench']},
 {n:'Single-leg RDL',rep:'3×10-12',m:{hamstrings:1,glutes:.7},e:['dumbbell']},
 {n:'Glute bridge',rep:'3×15-20',m:{glutes:1},e:['mat']},
 {n:'Banded hip thrust',rep:'3×15-25',m:{glutes:1},e:['bands']},
 {n:'Back squat',rep:'4×6-10',m:{quads:1,glutes:.6},e:['barbell','rack']},
 {n:'Front squat',rep:'3×6-10',m:{quads:1,core:.5},e:['barbell','rack']},
 {n:'Goblet squat',rep:'3×10-15',m:{quads:1,glutes:.5},e:['dumbbell']},
 {n:'Walking lunge',rep:'3×10-12',m:{quads:1,glutes:.7},e:['dumbbell']},
 {n:'Step-up',rep:'3×10-12',m:{quads:1,glutes:.6},e:['bench']},
 {n:'Nordic curl',rep:'3×5-8',m:{hamstrings:1},e:['mat']},
 {n:'Standing calf raise',rep:'4×15-20',m:{calves:1},e:['barbell']},
 {n:'Single-leg calf raise',rep:'3×15-20',m:{calves:1},e:['dumbbell']},
 {n:'Bodyweight calf raise',rep:'3×20-30',m:{calves:1},e:['bodyweight']},
 {n:'Hanging leg raise',rep:'3×10-15',m:{core:1},e:['dipbar']},
 {n:'Plank',rep:'3×45-60s',m:{core:1},e:['mat']},
 {n:'Sit-up',rep:'3×15-20',m:{core:1},e:['mat']},
 {n:'Russian twist',rep:'3×20',m:{core:1},e:['mat']},
 {n:'L-sit',rep:'3×max',m:{core:1},e:['dipbar']}
];
const CARDIO_LIB=[
 {n:'Easy Z2 run',d:'30–40 min conversational pace',tag:'run'},
 {n:'Tempo run',d:'20–25 min comfortably hard',tag:'run'},
 {n:'Run intervals',d:'6 × 2 min hard / 2 min easy',tag:'run'},
 {n:'Long easy run',d:'50–60 min all Z2',tag:'run'},
 {n:'Z2 trainer ride',d:'40–60 min steady',tag:'bike'},
 {n:'Sweet-spot ride',d:'3 × 8 min at ~88% FTP',tag:'bike'},
 {n:'FTP intervals',d:'5 × 3 min hard / 3 min easy',tag:'bike'},
 {n:'Recovery spin',d:'30 min very easy',tag:'bike'},
 {n:'Brick',d:'40 min bike + 15 min run off the bike',tag:'bike'}
];
const ALL_EQUIP=[{k:'barbell',l:'Barbell'},{k:'bench',l:'Bench'},{k:'rack',l:'Squat rack'},{k:'dumbbell',l:'Dumbbell'},{k:'dipbar',l:'Dip bar'},{k:'bands',l:'Resistance bands'},{k:'mat',l:'Mat'},{k:'pullup',l:'Pull-up bar'},{k:'biketrainer',l:'Bike trainer'}];
const DEFAULT_EQUIP=['barbell','bench','rack','dumbbell','dipbar','bands','mat','biketrainer'];
const EQ_LABEL={barbell:'Barbell',bench:'Bench',rack:'Rack',dumbbell:'Dumbbell',dipbar:'Dip bar',bands:'Bands',mat:'Mat',pullup:'Pull-up bar',biketrainer:'Bike trainer',bodyweight:'Bodyweight'};
const CARDIO_M={run:{quads:.4,hamstrings:.4,glutes:.35,calves:.5,core:.2},bike:{quads:.5,glutes:.3,calves:.3,hamstrings:.2}};
const DECAY_STR=8,DECAY_CARD=12,SET_UNIT=0.11;
const DEFAULT_GOAL='Lean, toned, athletic build without getting bulky. Three full-body strength days plus one cardio day. Keep a run and bike base for the half-Ironman deferred to next March. Train 0700 after Fajr. Home gym only.';

/* Anatomy polygons: MIT-licensed react-body-highlighter muscle map by GV79. */
const ANATOMY={"front":[{"mus":"chest","pts":["51.8367347 41.6326531 51.0204082 55.1020408 57.9591837 57.9591837 67.755102 55.5102041 70.6122449 47.3469388 62.0408163 41.6326531","29.7959184 46.5306122 31.4285714 55.5102041 40.8163265 57.9591837 48.1632653 55.1020408 47.755102 42.0408163 37.5510204 42.0408163"]},{"mus":"core","pts":["68.5714286 63.2653061 67.3469388 57.1428571 58.7755102 59.5918367 60 64.0816327 60.4081633 83.2653061 65.7142857 78.7755102 66.5306122 69.7959184","33.877551 78.3673469 33.0612245 71.8367347 31.0204082 63.2653061 32.244898 57.1428571 40.8163265 59.1836735 39.1836735 63.2653061 39.1836735 83.6734694"]},{"mus":"core","pts":["56.3265306 59.1836735 57.9591837 64.0816327 58.3673469 77.9591837 58.3673469 92.6530612 56.3265306 98.3673469 55.1020408 104.081633 51.4285714 107.755102 51.0204082 84.4897959 50.6122449 67.3469388 51.0204082 57.1428571","43.6734694 58.7755102 48.5714286 57.1428571 48.9795918 67.3469388 48.5714286 84.4897959 48.1632653 107.346939 44.4897959 103.673469 40.8163265 91.4285714 40.8163265 78.3673469 41.2244898 64.4897959"]},{"mus":"biceps","pts":["16.7346939 68.1632653 17.9591837 71.4285714 22.8571429 66.122449 28.9795918 53.877551 27.755102 49.3877551 20.4081633 55.9183673","71.4285714 49.3877551 70.2040816 54.6938776 76.3265306 66.122449 81.6326531 71.8367347 82.8571429 68.9795918 78.7755102 55.5102041"]},{"mus":"triceps","pts":["69.3877551 55.5102041 69.3877551 61.6326531 75.9183673 72.6530612 77.5510204 70.2040816 75.5102041 67.3469388","22.4489796 69.3877551 29.7959184 55.5102041 29.7959184 60.8163265 22.8571429 73.0612245"]},{"mus":"traps","pts":["55.5102041 23.6734694 50.6122449 33.4693878 50.6122449 39.1836735 61.6326531 40 70.6122449 44.8979592 69.3877551 36.7346939 63.2653061 35.1020408 58.3673469 30.6122449","28.9795918 44.8979592 30.2040816 37.1428571 36.3265306 35.1020408 41.2244898 30.2040816 44.4897959 24.4897959 48.9795918 33.877551 48.5714286 39.1836735 37.9591837 39.5918367"]},{"mus":"shoulders","pts":["78.3673469 53.0612245 79.5918367 47.755102 79.1836735 41.2244898 75.9183673 37.9591837 71.0204082 36.3265306 72.244898 42.8571429 71.4285714 47.3469388","28.1632653 47.3469388 21.2244898 53.0612245 20 47.755102 20.4081633 40.8163265 24.4897959 37.1428571 28.5714286 37.1428571 26.9387755 43.2653061"]},{"mus":null,"pts":["42.4489796 2.85714286 40 11.8367347 42.0408163 19.5918367 46.122449 23.2653061 49.7959184 25.3061224 54.6938776 22.4489796 57.5510204 19.1836735 59.1836735 10.2040816 57.1428571 2.44897959 49.7959184 0"]},{"mus":"glutes","pts":["52.6530612 110.204082 54.2857143 124.897959 60 110.204082 62.0408163 100 64.8979592 94.2857143 60 92.6530612 56.7346939 104.489796","47.755102 110.612245 44.8979592 125.306122 42.0408163 115.918367 40.4081633 113.061224 39.5918367 107.346939 37.9591837 102.44898 34.6938776 93.877551 39.5918367 92.244898 41.6326531 99.1836735 43.6734694 105.306122"]},{"mus":"quads","pts":["34.6938776 98.7755102 37.1428571 108.163265 37.1428571 127.755102 34.2857143 137.142857 31.0204082 132.653061 29.3877551 120 28.1632653 111.428571 29.3877551 100.816327 32.244898 94.6938776","63.2653061 105.714286 64.4897959 100 66.9387755 94.6938776 70.2040816 101.22449 71.0204082 111.836735 68.1632653 133.061224 65.3061224 137.55102 62.4489796 128.571429 62.0408163 111.428571","38.7755102 129.387755 38.3673469 112.244898 41.2244898 118.367347 44.4897959 129.387755 42.8571429 135.102041 40 146.122449 36.3265306 146.530612 35.5102041 140","59.5918367 145.714286 55.5102041 128.979592 60.8163265 113.877551 61.2244898 130.204082 64.0816327 139.591837 62.8571429 146.530612","32.6530612 138.367347 26.5306122 145.714286 25.7142857 136.734694 25.7142857 127.346939 26.9387755 114.285714 29.3877551 133.469388","71.8367347 113.061224 73.877551 124.081633 73.877551 140.408163 72.6530612 145.714286 66.5306122 138.367347 70.2040816 133.469388"]},{"mus":null,"pts":["33.877551 140 34.6938776 143.265306 35.5102041 147.346939 36.3265306 151.020408 35.1020408 156.734694 29.7959184 156.734694 27.3469388 152.653061 27.3469388 147.346939 30.2040816 144.081633","65.7142857 140 72.244898 147.755102 72.244898 152.244898 69.7959184 157.142857 64.8979592 156.734694 62.8571429 151.020408"]},{"mus":"calves","pts":["71.4285714 160.408163 73.4693878 153.469388 76.7346939 161.22449 79.5918367 167.755102 78.3673469 187.755102 79.5918367 195.510204 74.6938776 195.510204","24.8979592 194.693878 27.755102 164.897959 28.1632653 160.408163 26.122449 154.285714 24.8979592 157.55102 22.4489796 161.632653 20.8163265 167.755102 22.0408163 188.163265 20.8163265 195.510204","72.6530612 195.102041 69.7959184 159.183673 65.3061224 158.367347 64.0816327 162.44898 64.0816327 165.306122 65.7142857 177.142857","35.5102041 158.367347 35.9183673 162.44898 35.9183673 166.938776 35.1020408 172.244898 35.1020408 176.734694 32.244898 182.040816 30.6122449 187.346939 26.9387755 194.693878 27.3469388 187.755102 28.1632653 180.408163 28.5714286 175.510204 28.9795918 169.795918 29.7959184 164.081633 30.2040816 158.77551"]},{"mus":"forearms","pts":["6.12244898 88.5714286 10.2040816 75.1020408 14.6938776 70.2040816 16.3265306 74.2857143 19.1836735 73.4693878 4.48979592 97.5510204 0 100","84.4897959 69.7959184 83.2653061 73.4693878 80 73.0612245 95.1020408 98.3673469 100 100.408163 93.4693878 89.3877551 89.7959184 76.3265306","77.5510204 72.244898 77.5510204 77.5510204 80.4081633 84.0816327 85.3061224 89.7959184 92.244898 101.22449 94.6938776 99.5918367","6.93877551 101.22449 13.4693878 90.6122449 18.7755102 84.0816327 21.6326531 77.1428571 21.2244898 71.8367347 4.89795918 98.7755102"]}],"back":[{"mus":null,"pts":["50.6382979 0 45.9574468 0.85106383 40.8510638 5.53191489 40.4255319 12.7659574 45.106383 20 55.7446809 20 59.1489362 13.6170213 59.5744681 4.68085106 55.7446809 1.27659574"]},{"mus":"traps","pts":["44.6808511 21.7021277 47.6595745 21.7021277 47.2340426 38.2978723 47.6595745 64.6808511 38.2978723 53.1914894 35.3191489 40.8510638 31.0638298 36.5957447 39.1489362 33.1914894 43.8297872 27.2340426","52.3404255 21.7021277 55.7446809 21.7021277 56.5957447 27.2340426 60.8510638 32.7659574 68.9361702 36.5957447 64.6808511 40.4255319 61.7021277 53.1914894 52.3404255 64.6808511 53.1914894 38.2978723"]},{"mus":"shoulders","pts":["29.3617021 37.0212766 22.9787234 39.1489362 17.4468085 44.2553191 18.2978723 53.6170213 24.2553191 49.3617021 27.2340426 46.3829787","71.0638298 37.0212766 78.2978723 39.5744681 82.5531915 44.6808511 81.7021277 53.6170213 74.893617 48.9361702 72.3404255 45.106383"]},{"mus":"lats","pts":["31.0638298 38.7234043 28.0851064 48.9361702 28.5106383 55.3191489 34.0425532 75.3191489 47.2340426 71.0638298 47.2340426 66.3829787 36.5957447 54.0425532 33.6170213 41.2765957","68.9361702 38.7234043 71.9148936 49.3617021 71.4893617 56.1702128 65.9574468 75.3191489 52.7659574 71.0638298 52.7659574 66.3829787 63.4042553 54.4680851 66.3829787 41.7021277"]},{"mus":"triceps","pts":["26.8085106 49.787234 17.8723404 55.7446809 14.4680851 72.3404255 16.5957447 81.7021277 21.7021277 63.8297872 26.8085106 55.7446809","73.6170213 50.212766 82.1276596 55.7446809 85.9574468 73.1914894 83.4042553 82.1276596 77.8723404 62.9787234 73.1914894 55.7446809","26.8085106 58.2978723 26.8085106 68.5106383 22.9787234 75.3191489 19.1489362 77.4468085 22.5531915 65.5319149","72.7659574 58.2978723 77.0212766 64.6808511 80.4255319 77.4468085 76.5957447 75.3191489 72.7659574 68.9361702"]},{"mus":"lowerback","pts":["47.6595745 72.7659574 34.4680851 77.0212766 35.3191489 83.4042553 49.3617021 102.12766 46.8085106 82.9787234","52.3404255 72.7659574 65.5319149 77.0212766 64.6808511 83.4042553 50.6382979 102.12766 53.1914894 83.8297872"]},{"mus":"forearms","pts":["86.3829787 75.7446809 91.0638298 83.4042553 93.1914894 94.0425532 100 106.382979 96.1702128 104.255319 88.0851064 89.3617021 84.2553191 83.8297872","13.6170213 75.7446809 8.93617021 83.8297872 6.80851064 93.6170213 0 106.382979 3.82978723 104.255319 12.3404255 88.5106383 15.7446809 82.9787234","81.2765957 79.5744681 77.4468085 77.8723404 79.1489362 84.6808511 91.0638298 103.829787 93.1914894 108.93617 94.4680851 104.680851","18.7234043 79.5744681 22.1276596 77.8723404 20.8510638 84.2553191 9.36170213 102.978723 6.80851064 108.510638 5.10638298 104.680851"]},{"mus":"glutes","pts":["44.6808511 99.5744681 30.212766 108.510638 29.787234 118.723404 31.4893617 125.957447 47.2340426 121.276596 49.3617021 114.893617","55.3191489 99.1489362 51.0638298 114.468085 52.3404255 120.851064 68.0851064 125.957447 69.787234 119.148936 69.3617021 108.510638"]},{"mus":"quads","pts":["48.0851064 122.978723 44.6808511 122.978723 41.2765957 125.531915 45.106383 144.255319 48.5106383 135.744681 48.9361702 129.361702","51.9148936 122.553191 55.7446809 123.404255 59.1489362 125.957447 54.893617 144.255319 51.9148936 136.170213 51.0638298 129.361702"]},{"mus":"hamstrings","pts":["28.9361702 122.12766 31.0638298 129.361702 36.5957447 125.957447 35.3191489 135.319149 34.4680851 150.212766 29.3617021 158.297872 28.9361702 146.808511 27.6595745 141.276596 27.2340426 131.489362","71.4893617 121.702128 69.3617021 128.93617 63.8297872 125.957447 65.5319149 136.595745 66.3829787 150.212766 71.0638298 158.297872 71.4893617 147.659574 72.7659574 142.12766 73.6170213 131.914894","38.7234043 125.531915 44.2553191 145.957447 40.4255319 166.808511 36.1702128 152.765957 37.0212766 135.319149","61.7021277 125.531915 63.4042553 136.170213 64.2553191 153.191489 60 166.808511 56.1702128 146.382979"]},{"mus":null,"pts":["34.4680851 153.191489 31.0638298 159.148936 33.6170213 166.382979 37.4468085 162.553191","66.3829787 153.617021 62.9787234 162.978723 66.8085106 166.382979 69.3617021 159.148936"]},{"mus":"calves","pts":["29.3617021 160.425532 28.5106383 167.234043 24.6808511 179.574468 23.8297872 192.765957 25.5319149 197.021277 28.5106383 193.191489 29.787234 180 31.9148936 171.06383 31.9148936 166.808511","37.4468085 165.106383 35.3191489 167.659574 33.1914894 171.914894 31.0638298 180.425532 30.212766 191.914894 34.0425532 200 38.7234043 190.638298 39.1489362 168.93617","62.9787234 165.106383 61.2765957 168.510638 61.7021277 190.638298 66.3829787 199.574468 70.6382979 191.914894 68.9361702 179.574468 66.8085106 170.212766","70.6382979 160.425532 72.3404255 168.510638 75.7446809 179.148936 76.5957447 192.765957 74.4680851 196.595745 72.3404255 193.617021 70.6382979 179.574468 68.0851064 168.085106"]},{"mus":"calves","pts":["28.5106383 195.744681 30.212766 195.744681 33.6170213 201.702128 30.6382979 220 28.5106383 213.617021 26.8085106 198.297872"]},{"mus":"calves","pts":["69.787234 195.744681 71.9148936 195.744681 73.6170213 198.297872 71.9148936 213.191489 70.212766 219.574468 67.2340426 202.12766"]}]};

/* ---------------- memory ---------------- */
const STORE_KEY='wazeer.readiness.v1';
let storageOk=(function(){try{localStorage.setItem('__rb_probe','1');localStorage.removeItem('__rb_probe');return true;}catch(e){return false;}})();
let lastSaved=null,saveTimer=null,toastT=null;

let plan,sessions,cardio,equip,goalText;
let view='body',editMode=false,adding=false,editingGoal=false;
let cType='run',cInt='Easy',sheet=null,coachText=null;

function snapshot(){return{v:1,savedAt:Date.now(),plan:plan,sessions:sessions.filter(function(s){return !emptyS(s);}),cardio:cardio,equipment:equip,goal:goalText};}
function commit(quiet){
  if(!storageOk){renderWarn();return;}
  try{
    var payload=snapshot();
    localStorage.setItem(STORE_KEY,JSON.stringify(payload));
    lastSaved=payload.savedAt;
    updateSavedLine();
    if(!quiet)flash('Saved');
  }catch(e){storageOk=false;renderWarn();flash('Could not save — storage is full or blocked');}
}
function queueSave(){clearTimeout(saveTimer);saveTimer=setTimeout(function(){commit(true);},400);}
function flash(msg){var t=document.getElementById('toast');t.textContent=msg||'Saved';t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('show');},1400);}
function updateSavedLine(){
  var el=document.getElementById('savedline');
  if(!storageOk){el.textContent='Not saving';el.style.color='var(--red)';return;}
  el.style.color='var(--green)';
  if(!lastSaved){el.textContent='Saved on this device';return;}
  var d=new Date(lastSaved),p=function(n){return String(n).padStart(2,'0');};
  el.textContent='Saved '+p(d.getHours())+':'+p(d.getMinutes());
}
function renderWarn(){
  var el=document.getElementById('warn');
  el.innerHTML=storageOk?'':'<div class="warnbar"><b>Nothing is being saved.</b> This browser is blocking site storage, usually a private window or a "block site data" setting. Open the board in a normal window, or your log disappears when you close the tab.</div>';
}

/* ---------------- helpers ---------------- */
function today(){var d=new Date(),p=function(n){return String(n).padStart(2,'0');};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());}
function fmtDate(s){var a=s.split('-').map(Number);return new Date(a[0],a[1]-1,a[2]).toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'});}
function daysAgo(s){var a=s.split('-').map(Number);var then=new Date(a[0],a[1]-1,a[2]);var now=new Date();now.setHours(0,0,0,0);return Math.round((now-then)/86400000);}
function uid(){return 'x'+Math.random().toString(36).slice(2,8);}
function dayById(id){return plan.days.find(function(d){return d.id===id;});}
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function emptyS(s){if(s.warmup)return false;return !Object.values(s.entries||{}).some(function(e){return e.sets.some(function(x){return x.w||x.r;});});}
function favList(){var r=[];plan.days.forEach(function(d){d.exercises.forEach(function(e){if(e.fav)r.push(e.name);});});return r;}
function autoMuscles(name){var low=name.toLowerCase();var hit=EX_LIB.find(function(x){return low.includes(x.n.toLowerCase())||x.n.toLowerCase().includes(low);});return hit?hit.m:{};}
function icon(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';}

function currentSession(){
  var d=today();var s=sessions.find(function(x){return x.date===d&&x.dayId===view;});
  if(!s){s={date:d,dayId:view,warmup:false,entries:{}};sessions.push(s);}
  dayById(view).exercises.forEach(function(ex){
    if(!s.entries[ex.id])s.entries[ex.id]={name:ex.name,m:ex.m||{},sets:Array.from({length:ex.sets},function(){return{w:'',r:''};})};
    else if(!s.entries[ex.id].m)s.entries[ex.id].m=ex.m||{};
  });
  return s;
}
function lastFor(exId){
  var d=today();
  var prev=sessions.filter(function(s){return s.date<d&&s.entries[exId];}).sort(function(a,b){return b.date<a.date?-1:1;});
  for(var i=0;i<prev.length;i++){
    var done=prev[i].entries[exId].sets.filter(function(x){return x.w||x.r;});
    if(done.length){
      var top=done.reduce(function(a,b){return (parseFloat(b.w)||0)>(parseFloat(a.w)||0)?b:a;});
      return (top.w?top.w+'kg':'')+(top.w&&top.r?' × ':'')+(top.r?top.r:'');
    }
  }
  return null;
}
function weekStart(){var d=new Date();var off=(d.getDay()+6)%7;d.setDate(d.getDate()-off);d.setHours(0,0,0,0);return d;}
function stats(){
  var strengthDone=sessions.filter(function(s){return !emptyS(s);});
  var total=strengthDone.length+cardio.length;
  var level=Math.floor(total/5)+1;
  var rank=total>=50?'Elite':total>=25?'Specialist':total>=10?'Operator':'Recruit';
  var ws=weekStart();
  var inWk=function(s){var a=s.date.split('-').map(Number);return new Date(a[0],a[1]-1,a[2])>=ws;};
  var wk=strengthDone.filter(inWk).length+cardio.filter(inWk).length;
  return{total:total,level:level,rank:rank,wk:wk};
}

/* ---------------- heat engine ---------------- */
function computeHeat(){
  var h={};MUSCLES.forEach(function(m){h[m]=0;});var engine=0;var lastDay={};
  sessions.forEach(function(s){
    var rec=Math.max(0,1-daysAgo(s.date)/DECAY_STR);if(rec<=0)return;
    Object.values(s.entries).forEach(function(e){
      var worked=e.sets.filter(function(x){return x.w||x.r;}).length;if(!worked)return;
      var mm=(e.m&&Object.keys(e.m).length)?e.m:autoMuscles(e.name);
      Object.entries(mm).forEach(function(pair){
        var mus=pair[0],w=pair[1];
        if(h[mus]===undefined)return;
        h[mus]=Math.min(1,h[mus]+w*SET_UNIT*worked*rec);
        if(w>=.6&&(lastDay[mus]===undefined||daysAgo(s.date)<lastDay[mus]))lastDay[mus]=daysAgo(s.date);
      });
    });
  });
  cardio.forEach(function(c){
    var recC=Math.max(0,1-daysAgo(c.date)/DECAY_CARD);
    var recS=Math.max(0,1-daysAgo(c.date)/DECAY_STR);
    var im=c.intensity==='Hard'?1.4:c.intensity==='Tempo'?1.2:1;
    var vol=(c.min||30)/40;
    engine=Math.min(1,engine+0.5*vol*im*recC);
    if(recS>0){Object.entries(CARDIO_M[c.type]||{}).forEach(function(pair){h[pair[0]]=Math.min(1,h[pair[0]]+pair[1]*vol*im*0.18*recS);});}
  });
  return{h:h,engine:engine,lastDay:lastDay};
}
function heatColor(v){
  v=Math.max(0,Math.min(1,v));
  var stops=[[0,[0x2C,0x35,0x2F]],[0.45,[0x4F,0x9E,0x36]],[0.75,[0xCE,0x94,0x2E]],[1,[0xD6,0x5A,0x3A]]];
  for(var i=1;i<stops.length;i++){
    if(v<=stops[i][0]){
      var p0=stops[i-1][0],c0=stops[i-1][1],p1=stops[i][0],c1=stops[i][1];
      var t=(v-p0)/(p1-p0||1);
      return 'rgb('+c0.map(function(x,j){return Math.round(x+(c1[j]-x)*t);}).join(',')+')';
    }
  }
  return 'rgb(214,90,58)';
}
function bodySVG(){
  var h=computeHeat().h;
  var draw=function(list){return list.map(function(o){
    var fill=o.mus?heatColor(h[o.mus]):'#20281F';
    var attr=o.mus?(' class="mz" data-muscle="'+o.mus+'"'):' class="anat-base"';
    return o.pts.map(function(p){return '<polygon'+attr+' fill="'+fill+'" points="'+p+'"/>';}).join('');
  }).join('');};
  var s='<svg viewBox="0 0 200 206" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Muscle heat map, front and back">';
  s+='<g>'+draw(ANATOMY.front)+'</g><g transform="translate(100 0)">'+draw(ANATOMY.back)+'</g>';
  s+='<text x="50" y="204" text-anchor="middle" class="fig-label">Front</text><text x="150" y="204" text-anchor="middle" class="fig-label">Back</text></svg>';
  return s;
}

/* ---------------- the briefing ----------------
   Reads the same live heat the board draws: coldest muscles, what is
   still recovering, which plan day covers the gaps best, engine, goal. */
function joinNames(arr){
  var n=arr.map(function(m){return MLABEL[m].toLowerCase();});
  if(n.length===1)return n[0];
  if(n.length===2)return n[0]+' and '+n[1];
  return n.slice(0,-1).join(', ')+' and '+n[n.length-1];
}
function firstSentence(t){
  var s=String(t||'').trim();if(!s)return '';
  var m=s.match(/^[^.!?]{1,160}[.!?]/);
  return (m?m[0]:s.slice(0,160)).replace(/[.!?]\s*$/,'');
}
function buildBriefing(){
  var r=computeHeat(),h=r.h,engine=r.engine,lastDay=r.lastDay;
  var logged=sessions.filter(function(s){return !emptyS(s);}).length+cardio.length;
  var favs=favList();
  var out=[];
  var goalLine=firstSentence(goalText);

  if(!logged){
    var first=plan.days[0];
    out.push('The board is blank, every muscle reads cold, so there is nothing to recover from and no wrong place to start.');
    out.push('Open with '+first.name+', the '+first.focus.toLowerCase()+' day, and log every set as you go so the map has something real to work from.');
    out.push(favs.length?('Lead with '+favs[0]+' to make the session feel like yours.'):'Tap the star on the lifts you actually enjoy and they will start shaping these reads.');
    if(goalLine)out.push('Mission still reads: '+goalLine+'.');
    return out.join(' ');
  }

  var ranked=MUSCLES.slice().sort(function(a,b){
    if(h[a]!==h[b])return h[a]-h[b];
    var la=lastDay[a]===undefined?999:lastDay[a],lb=lastDay[b]===undefined?999:lastDay[b];
    return lb-la;
  });
  var cold=ranked.slice(0,3);
  var hot=MUSCLES.filter(function(m){return h[m]>=0.5;}).sort(function(a,b){return h[b]-h[a];}).slice(0,2);

  var never=cold.filter(function(m){return lastDay[m]===undefined;});
  var staleNote='';
  if(never.length){staleNote=' Nothing on record for '+joinNames(never.slice(0,2))+' at all.';}
  else{
    var worst=cold.reduce(function(a,b){return (lastDay[b]||0)>(lastDay[a]||0)?b:a;});
    if(lastDay[worst]>=6)staleNote=' '+MLABEL[worst]+' last took real load '+lastDay[worst]+' days ago.';
  }
  out.push(joinNames(cold).replace(/^./,function(c){return c.toUpperCase();})+' are reading coldest right now.'+staleNote);

  out.push(hot.length
    ?(joinNames(hot).replace(/^./,function(c){return c.toUpperCase();})+' '+(hot.length>1?'are':'is')+' still carrying load from the last few days, so leave '+(hot.length>1?'them':'it')+' to finish recovering.')
    :'Nothing is deep in recovery, so you have a clear run at whatever you pick.');

  var scored=plan.days.map(function(d){
    var sc=0;
    d.exercises.forEach(function(e){
      Object.entries(e.m||{}).forEach(function(pair){if(h[pair[0]]!==undefined)sc+=pair[1]*(1-h[pair[0]]);});
    });
    return{d:d,sc:sc};
  }).sort(function(a,b){return b.sc-a.sc;});
  var pick=scored[0].d;
  var pickFav=pick.exercises.filter(function(e){return e.fav;})[0];
  out.push('Run '+pick.name+' next, the '+pick.focus.toLowerCase()+' day, because it lands hardest on what has faded'
    +(pickFav?(', and '+pickFav.name+' is already sitting in it.'):'.'));

  var pct=Math.round(engine*100);
  var eng=pct<25?('Aerobic engine is down at '+pct+'%, so get an easy run or a steady ride in this week before the base slips any further.')
    :pct<60?('Engine is ticking over at '+pct+'%, one more easy session keeps that base honest.')
    :('Engine is strong at '+pct+'%, it is the strength side that wants the attention now.');
  out.push(eng+(goalLine?(' Mission still reads: '+goalLine+'.'):''));

  return out.join(' ');
}

