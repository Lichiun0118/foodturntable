import streamlit as st
import streamlit.components.v1 as components
import json

# 設定頁面資訊
st.set_page_config(page_title="公館晚餐吃什麼", page_icon="👾", layout="centered")

# ==========================================
# 注入 Y2K 復古風格 CSS (修改 Streamlit 預設外觀)
# ==========================================
st.markdown("""
<style>
    /* 匯入復古像素字體 */
    @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');

    /* 全局背景與字體 */
    .stApp {
        background-color: #0b001a;
        background-image: 
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 255, 0.1) 1px, transparent 1px);
        background-size: 30px 30px;
        font-family: 'DotGothic16', sans-serif !important;
        color: #00ffff;
    }
    
    /* 標題特效 */
    h1 {
        color: #ff00ff !important;
        text-shadow: 4px 4px 0px #00ffff, -2px -2px 0px #ffff00;
        font-weight: 900 !important;
        text-align: center;
        letter-spacing: 2px;
    }
    h3, p, label {
        color: #39ff14 !important;
        text-shadow: 1px 1px 2px #000;
    }

    /* 輸入框與下拉選單 */
    .stTextInput>div>div>input, .stSelectbox>div>div>div {
        background-color: #000 !important;
        color: #ff00ff !important;
        border: 2px solid #00ffff !important;
        border-radius: 0px !important;
        box-shadow: 3px 3px 0px #ff00ff;
        font-family: 'DotGothic16', sans-serif !important;
        font-size: 1.2rem !important;
    }

    /* 按鈕樣式 (復古立體感) */
    .stButton>button {
        background-color: #c0c0c0 !important;
        color: #000 !important;
        border: 2px solid #fff !important;
        border-right-color: #000 !important;
        border-bottom-color: #000 !important;
        border-radius: 0px !important;
        font-family: 'DotGothic16', sans-serif !important;
        font-size: 1.2rem !important;
        font-weight: bold !important;
        box-shadow: inset 1px 1px #fff, inset -1px -1px #808080;
    }
    .stButton>button:active {
        border: 2px solid #000 !important;
        border-right-color: #fff !important;
        border-bottom-color: #fff !important;
        box-shadow: inset 1px 1px #808080, inset -1px -1px #fff;
    }
</style>
""", unsafe_allow_html=True)

st.title("👾 晚餐吃什麼 v2.0 💿")

if "options" not in st.session_state:
    st.session_state.options = ["小高", "MDD", "藏壽司", "麥當勞"]

add_col, remove_col = st.columns(2)

with add_col:
    st.markdown("### 💾 新增選項")
    new_option_text = st.text_input("輸入新選項：", label_visibility="collapsed")
    if st.button(">> INJECT <<", use_container_width=True):
        if new_option_text.strip() and new_option_text.strip() not in st.session_state.options:
            st.session_state.options.append(new_option_text.strip())
            st.rerun()

with remove_col:
    st.markdown("### 🗑️ 移除選項")
    option_to_remove = st.selectbox("選擇要移除的選項：", st.session_state.options, label_visibility="collapsed")
    if st.button(">> DELETE <<", use_container_width=True):
        if option_to_remove in st.session_state.options:
            st.session_state.options.remove(option_to_remove)
            st.rerun()

st.markdown(f"**[ CURRENT DATA ({len(st.session_state.options)}) ]**： " + " // ".join(st.session_state.options))
st.markdown("---")

if len(st.session_state.options) > 0:
    options_json = json.dumps(st.session_state.options)
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=DotGothic16&display=swap" rel="stylesheet">
        <style>
            body {{ 
                display: flex; flex-direction: column; align-items: center; 
                font-family: 'DotGothic16', sans-serif; overflow: hidden; 
                background: transparent; color: #fff;
            }}
            #wheel-container {{ position: relative; width: 400px; height: 400px; margin-top: 40px; }}
            
            /* Y2K 發光轉盤邊框 */
            #wheelCanvas {{
                width: 100%; height: 100%; border-radius: 50%;
                border: 8px solid #c0c0c0;
                box-shadow: 0 0 20px #ff00ff, inset 0 0 20px #00ffff;
                transition: transform 4s cubic-bezier(0.17, 0.67, 0.1, 1);
            }}
            
            /* 螢光綠指標 */
            #pointer {{
                position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
                width: 0; height: 0;
                border-left: 20px solid transparent; border-right: 20px solid transparent;
                border-top: 50px solid #39ff14; z-index: 10;
                filter: drop-shadow(0 0 10px #39ff14);
            }}
            
            /* 發光按鈕 */
            button {{
                padding: 12px 30px; font-size: 22px; font-weight: bold;
                background-color: #ff00ff; color: #fff; border: 3px solid #00ffff;
                box-shadow: 4px 4px 0px #00ffff; cursor: pointer; margin-top: 10px;
                font-family: 'DotGothic16', sans-serif;
                text-transform: uppercase; letter-spacing: 2px;
                transition: 0.1s;
            }}
            button:active {{
                transform: translate(4px, 4px);
                box-shadow: 0px 0px 0px #00ffff;
            }}
            
            /* 中獎閃爍文字 */
            #resultText {{ 
                margin-top: 30px; font-size: 30px; font-weight: bold; 
                color: #ffff00; text-shadow: 0 0 10px #ff00ff;
                text-align: center;
            }}
            .blink {{ animation: blinker 0.8s linear infinite; }}
            @keyframes blinker {{ 50% {{ opacity: 0; }} }}
        </style>
    </head>
    <body>
        <button onclick="executeSpin()">START_SPIN.exe</button>
        <div id="wheel-container">
            <div id="pointer"></div>
            <canvas id="wheelCanvas" width="400" height="400"></canvas>
        </div>
        <div id="resultText" class="blink">>>> WAITING <<<</div>

        <script>
            const wheelOptions = {options_json};
            const canvas = document.getElementById('wheelCanvas');
            const ctx = canvas.getContext('2d');
            const resultTextElement = document.getElementById('resultText');
            
            // Y2K 螢光調色盤 (桃紅、青藍、螢光綠、亮黃、紫色、橘色)
            const colorPalette = ['#FF00FF', '#00FFFF', '#39FF14', '#FFFF00', '#9D00FF', '#FF6600'];
            
            const totalOptions = wheelOptions.length;
            const arcRadian = (2 * Math.PI) / totalOptions;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const wheelRadius = centerX;

            function renderWheel() {{
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                for (let i = 0; i < totalOptions; i++) {{
                    const startAngle = i * arcRadian - (Math.PI / 2) - (arcRadian / 2);
                    const endAngle = startAngle + arcRadian;
                    
                    // 繪製扇形
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
                    ctx.fillStyle = colorPalette[i % colorPalette.length];
                    ctx.fill();
                    ctx.strokeStyle = "#000"; // 黑色粗線切割
                    ctx.lineWidth = 4;
                    ctx.stroke();
                    
                    // 繪製文字
                    ctx.save();
                    ctx.translate(centerX, centerY);
                    ctx.rotate(startAngle + arcRadian / 2);
                    ctx.textAlign = "right";
                    ctx.fillStyle = "#000"; // 黑字比較看得清楚
                    ctx.font = "bold 24px 'DotGothic16', sans-serif";
                    ctx.fillText(wheelOptions[i], wheelRadius - 30, 8);
                    ctx.restore();
                }}
            }}

            // 確保字體載入後再畫圖
            document.fonts.ready.then(function () {{
                renderWheel();
            }});

            let accumulatedRotation = 0;

            function executeSpin() {{
                resultTextElement.innerText = ">>> SPINNING... <<<";
                resultTextElement.classList.add("blink");
                
                const baseSpins = (Math.floor(Math.random() * 6) + 5) * 360;
                const randomAngleOffset = Math.floor(Math.random() * 360);
                accumulatedRotation += baseSpins + randomAngleOffset;
                
                canvas.style.transform = `rotate(${{accumulatedRotation}}deg)`;
                
                setTimeout(() => {{
                    const sliceDegree = 360 / totalOptions;
                    const relativeAngle = (360 - (accumulatedRotation % 360)) % 360;
                    const shiftedAngle = (relativeAngle + sliceDegree / 2) % 360;
                    const winningIndex = Math.floor(shiftedAngle / sliceDegree);
                    
                    resultTextElement.innerText = "⭐ WINNER: " + wheelOptions[winningIndex] + " ⭐";
                    resultTextElement.classList.remove("blink"); // 停止閃爍
                }}, 4000);
            }}
        </script>
    </body>
    </html>
    """
    
    components.html(html_content, height=600)
else:
    st.error("[ERROR] DATABASE EMPTY. PLEASE INJECT OPTIONS.")