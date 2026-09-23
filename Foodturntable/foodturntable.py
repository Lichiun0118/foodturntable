import streamlit as st
import streamlit.components.v1 as components
import json

st.set_page_config(page_title="公館晚餐吃什麼", page_icon="🎡")
st.title("🎡 公館晚餐吃什麼")

if "options" not in st.session_state:
    st.session_state.options = ["小高", "MDD", "藏壽司"]

add_col, remove_col = st.columns(2)

with add_col:
    st.subheader("➕ 新增選項")
    new_option_text = st.text_input("輸入新選項：", label_visibility="collapsed")
    if st.button("加入", use_container_width=True):
        if new_option_text.strip() and new_option_text.strip() not in st.session_state.options:
            st.session_state.options.append(new_option_text.strip())
            st.rerun()

with remove_col:
    st.subheader("➖ 移除選項")
    option_to_remove = st.selectbox("選擇要移除的選項：", st.session_state.options, label_visibility="collapsed")
    if st.button("移除", use_container_width=True):
        if option_to_remove in st.session_state.options:
            st.session_state.options.remove(option_to_remove)
            st.rerun()

st.write(f"**目前選項 ({len(st.session_state.options)} 個)：**", "、".join(st.session_state.options))
st.markdown("---")

if len(st.session_state.options) > 0:
    options_json = json.dumps(st.session_state.options)
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ display: flex; flex-direction: column; align-items: center; font-family: sans-serif; overflow: hidden; }}
            /* 修正 1：將 margin-top 從 20px 增加到 40px，避免與上方按鈕重疊 */
            #wheel-container {{ position: relative; width: 400px; height: 400px; margin-top: 40px; }}
            #wheelCanvas {{
                width: 100%; height: 100%; border-radius: 50%;
                border: 5px solid #333;
                transition: transform 4s cubic-bezier(0.17, 0.67, 0.1, 1);
            }}
            #pointer {{
                position: absolute; top: -15px; left: 50%; transform: translateX(-50%);
                width: 0; height: 0;
                border-left: 20px solid transparent; border-right: 20px solid transparent;
                border-top: 40px solid #e74c3c; z-index: 10;
            }}
            button {{
                padding: 10px 20px; font-size: 18px; font-weight: bold;
                background-color: #4CAF50; color: white; border: none;
                border-radius: 5px; cursor: pointer; margin-top: 10px;
            }}
            button:hover {{ background-color: #45a049; }}
            #resultText {{ margin-top: 20px; font-size: 24px; font-weight: bold; color: #d35400; }}
        </style>
    </head>
    <body>
        <button onclick="executeSpin()">🚀 開始旋轉！</button>
        <div id="wheel-container">
            <div id="pointer"></div>
            <canvas id="wheelCanvas" width="400" height="400"></canvas>
        </div>
        <div id="resultText">等待旋轉...</div>

        <script>
            const wheelOptions = {options_json};
            const canvas = document.getElementById('wheelCanvas');
            const ctx = canvas.getContext('2d');
            const resultTextElement = document.getElementById('resultText');
            const colorPalette = ['#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#3498db', '#1abc9c'];
            
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
                    
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
                    ctx.fillStyle = colorPalette[i % colorPalette.length];
                    ctx.fill();
                    ctx.strokeStyle = "#333";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    ctx.save();
                    ctx.translate(centerX, centerY);
                    ctx.rotate(startAngle + arcRadian / 2);
                    ctx.textAlign = "right";
                    ctx.fillStyle = "#fff";
                    ctx.font = "bold 20px sans-serif";
                    ctx.fillText(wheelOptions[i], wheelRadius - 30, 8);
                    ctx.restore();
                }}
            }}

            renderWheel();

            let accumulatedRotation = 0;

            function executeSpin() {{
                resultTextElement.innerText = "旋轉中...";
                
                const baseSpins = (Math.floor(Math.random() * 6) + 5) * 360;
                const randomAngleOffset = Math.floor(Math.random() * 360);
                accumulatedRotation += baseSpins + randomAngleOffset;
                
                canvas.style.transform = `rotate(${{accumulatedRotation}}deg)`;
                
                setTimeout(() => {{
                    // 修正 2：重新設計角度換算公式，精準對齊視覺上的扇形邊界
                    const sliceDegree = 360 / totalOptions;
                    // 計算相對於原本正上方位置的相對角度
                    const relativeAngle = (360 - (accumulatedRotation % 360)) % 360;
                    // 加上半個扇形的角度偏移量，以補償 Canvas 繪製時的起點差異
                    const shiftedAngle = (relativeAngle + sliceDegree / 2) % 360;
                    // 取得真正指向的陣列索引
                    const winningIndex = Math.floor(shiftedAngle / sliceDegree);
                    
                    resultTextElement.innerText = "🎉 結果：" + wheelOptions[winningIndex] + " 🎉";
                }}, 4000);
            }}
        </script>
    </body>
    </html>
    """
    
    components.html(html_content, height=600)
else:
    st.warning("轉盤裡目前沒有選項，請先新增！")