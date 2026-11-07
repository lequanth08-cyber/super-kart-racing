const fs=require('fs');
// Ghép khung giao diện: phần đầu (CSS) + phần thân (HTML)
const khung=fs.readFileSync('khung_dau.txt','utf8')+fs.readFileSync('khung_than.txt','utf8');
fs.writeFileSync('khung.html',khung);
const three=fs.readFileSync('three.min.js','utf8');
if(three.includes('</script')) throw new Error('three chua </script');
const g=['a_hangso.js','a1_nhanvat.js','a2_engine.js','a3_hauky.js','b_duongdua.js','c_xe.js','d_vatly.js','d2_vatpham.js','d3_tuyetky.js','e_ai.js','f_luat.js','g_giaodien.js'];
const game=g.map(f=>fs.readFileSync(f,'utf8')).join('\n');
if(game.includes('</script')) throw new Error('game chua </script');
let out=khung.replace('/*THREE_JS*/',()=>three).replace('/*GAME_JS*/',()=>game);
fs.writeFileSync('../index.html',out);
fs.writeFileSync('game_gop.js',game);
console.log('index.html',(out.length/1024).toFixed(0)+' KB');
