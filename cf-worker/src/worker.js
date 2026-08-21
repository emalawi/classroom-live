const HTML_PAGE = "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Classroom Live</title>\n  <script src=\"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js\"></script>\n  <style>\n    * { box-sizing: border-box; }\n    body {\n      margin: 0;\n      font-family: 'Segoe UI', Roboto, sans-serif;\n      background: linear-gradient(135deg, #667eea, #764ba2);\n      min-height: 100vh;\n      color: #222;\n    }\n\n    #roleSelect {\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      justify-content: center;\n      min-height: 100vh;\n      text-align: center;\n      color: white;\n      animation: fadeIn 0.6s ease;\n      padding: 20px;\n    }\n    #roleSelect h2 { font-size: 2rem; margin-bottom: 4px; }\n    #roleSelect p { opacity: 0.9; margin-bottom: 20px; }\n    #roleSelect button {\n      padding: 14px 28px;\n      margin: 8px;\n      font-size: 1rem;\n      border: none;\n      border-radius: 30px;\n      cursor: pointer;\n      font-weight: 600;\n      transition: transform 0.15s ease, box-shadow 0.15s ease;\n      box-shadow: 0 4px 14px rgba(0,0,0,0.25);\n    }\n    #teacherBtn { background: #ff6b6b; color: white; }\n    #studentBtn { background: #4ecdc4; color: white; }\n    #roleSelect button:active { transform: scale(0.95); }\n    #roleSelect input {\n      padding: 12px;\n      border-radius: 20px;\n      border: none;\n      width: 240px;\n      max-width: 80vw;\n      text-align: center;\n      font-size: 1rem;\n    }\n    #hostForm button, #joinForm button {\n      padding: 14px 28px;\n      margin-top: 6px;\n      font-size: 1rem;\n      border: none;\n      border-radius: 30px;\n      cursor: pointer;\n      font-weight: 600;\n      background: #ffe66d;\n      color: #333;\n    }\n    .backLink {\n      background: transparent;\n      color: white;\n      text-decoration: underline;\n      box-shadow: none;\n      font-size: 0.85rem;\n      margin-top: 14px;\n    }\n    #relayNotice {\n      background: rgba(255,255,255,0.15);\n      border: 2px solid #ffe66d;\n      border-radius: 12px;\n      padding: 10px 14px;\n      margin: 10px 16px;\n      font-size: 0.85rem;\n      color: white;\n      display: none;\n    }\n\n    #topBar {\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      background: rgba(255,255,255,0.1);\n      backdrop-filter: blur(6px);\n      padding: 10px 16px;\n      color: white;\n      flex-wrap: wrap;\n      gap: 8px;\n    }\n    #topBar h2 { margin: 0; font-size: 1.2rem; }\n    #topBar .controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }\n    #topBar button {\n      padding: 8px 14px;\n      border: none;\n      border-radius: 20px;\n      cursor: pointer;\n      font-weight: 600;\n      background: #ffe66d;\n      color: #333;\n      transition: transform 0.15s ease;\n    }\n    #topBar button:disabled { opacity: 0.5; cursor: not-allowed; }\n    #topBar button:active:not(:disabled) { transform: scale(0.93); }\n    #toggleLeftBtn { background: #a29bfe; color: white; }\n    #status { font-size: 0.85rem; margin: 0; opacity: 0.9; }\n    #roomIdBadge {\n      background: rgba(255,255,255,0.2);\n      padding: 4px 10px;\n      border-radius: 12px;\n      font-size: 0.8rem;\n      font-weight: 600;\n    }\n\n    #mainApp { display: none; }\n    #layout {\n      display: flex;\n      height: calc(100vh - 56px);\n      overflow: hidden;\n    }\n\n    #leftPanel {\n      width: 340px;\n      min-width: 340px;\n      background: rgba(255,255,255,0.95);\n      display: flex;\n      flex-direction: column;\n      transition: margin-left 0.3s ease;\n      overflow-y: auto;\n      padding: 12px;\n    }\n    #leftPanel.collapsed { margin-left: -340px; }\n\n    #rightPanel {\n      flex: 1;\n      background: rgba(255,255,255,0.9);\n      padding: 12px;\n      overflow-y: auto;\n    }\n\n    h3 {\n      margin: 6px 0;\n      color: #764ba2;\n      border-bottom: 2px solid #eee;\n      padding-bottom: 4px;\n    }\n\n    #chatBox {\n      border: 1px solid #ddd;\n      border-radius: 10px;\n      height: 220px;\n      overflow-y: auto;\n      padding: 8px;\n      background: #fafaff;\n    }\n    .chatLine {\n      margin-bottom: 8px;\n      padding: 6px 10px;\n      border-radius: 12px;\n      max-width: 85%;\n      animation: slideUp 0.25s ease;\n      word-wrap: break-word;\n    }\n    .chatLine.teacher { background: #ffe0e0; margin-right: auto; }\n    .chatLine.student { background: #d6f5f2; margin-left: auto; text-align: right; }\n    .chatLine strong { display: block; font-size: 0.75rem; opacity: 0.7; }\n\n    #chatInputRow { display: flex; gap: 6px; margin-top: 8px; }\n    #chatInput {\n      flex: 1;\n      padding: 10px;\n      border-radius: 20px;\n      border: 1px solid #ccc;\n    }\n    #sendChatBtn {\n      padding: 10px 16px;\n      border: none;\n      border-radius: 20px;\n      background: #ff6b6b;\n      color: white;\n      font-weight: 600;\n      cursor: pointer;\n    }\n    #sendChatBtn:active { transform: scale(0.93); }\n\n    #teacherPollControls, #pollDisplay {\n      border: 1px solid #eee;\n      border-radius: 10px;\n      padding: 10px;\n      margin-top: 10px;\n      background: #fffdf5;\n      animation: fadeIn 0.4s ease;\n    }\n    #teacherPollControls input {\n      width: 100%;\n      padding: 8px;\n      margin: 4px 0;\n      border-radius: 8px;\n      border: 1px solid #ccc;\n    }\n    #createPollBtn {\n      padding: 10px 16px;\n      border: none;\n      border-radius: 20px;\n      background: #a29bfe;\n      color: white;\n      font-weight: 600;\n      cursor: pointer;\n      margin-top: 6px;\n    }\n    #pollOptionsContainer button {\n      display: block;\n      width: 100%;\n      padding: 10px;\n      margin: 6px 0;\n      border: none;\n      border-radius: 10px;\n      background: linear-gradient(135deg, #4ecdc4, #556270);\n      color: white;\n      font-weight: 600;\n      cursor: pointer;\n      transition: transform 0.15s ease;\n    }\n    #pollOptionsContainer button:active { transform: scale(0.96); }\n    #pollOptionsContainer button:disabled { opacity: 0.6; }\n    #pollResults div {\n      padding: 6px 8px;\n      margin: 4px 0;\n      background: #f0f0ff;\n      border-radius: 8px;\n      animation: fadeIn 0.4s ease;\n    }\n\n    #pdfControls { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }\n    #pdfControls button {\n      padding: 8px 14px;\n      border: none;\n      border-radius: 20px;\n      background: #764ba2;\n      color: white;\n      font-weight: 600;\n      cursor: pointer;\n    }\n    #pdfControls button:disabled { opacity: 0.5; }\n    #pdfCanvas {\n      border: 2px solid #764ba2;\n      border-radius: 10px;\n      max-width: 100%;\n      display: block;\n      margin: 0 auto;\n      box-shadow: 0 6px 18px rgba(0,0,0,0.15);\n      animation: fadeIn 0.4s ease;\n    }\n\n    #studentsList {\n      font-size: 0.85rem;\n      background: #f5f0ff;\n      border-radius: 8px;\n      padding: 6px 10px;\n      margin-top: 6px;\n    }\n\n    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }\n    @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }\n    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255,107,107,0.5); } 70% { box-shadow: 0 0 0 10px rgba(255,107,107,0); } 100% { box-shadow: 0 0 0 0 rgba(255,107,107,0); } }\n    #status.connected { animation: pulse 1.5s ease-in-out 2; color: #ffe66d; font-weight: 600; }\n\n    @media (max-width: 800px) {\n      #leftPanel {\n        position: fixed;\n        top: 56px;\n        left: 0;\n        bottom: 0;\n        width: 85%;\n        z-index: 50;\n        box-shadow: 4px 0 20px rgba(0,0,0,0.3);\n      }\n      #leftPanel.collapsed { margin-left: -100%; }\n      #rightPanel { width: 100%; }\n      #topBar h2 { font-size: 1rem; }\n      #topBar button { padding: 7px 10px; font-size: 0.85rem; }\n    }\n  </style>\n</head>\n<body>\n  <div id=\"roleSelect\">\n    <h2>🎓 Classroom Live</h2>\n\n    <div id=\"roleChoiceButtons\">\n      <p>Are you a teacher or a student?</p>\n      <button id=\"teacherBtn\">I'm a Teacher</button>\n      <button id=\"studentBtn\">I'm a Student</button>\n    </div>\n\n    <div id=\"hostForm\" style=\"display:none;\">\n      <p>Create a Meeting ID for your class</p>\n      <input type=\"text\" id=\"hostRoomIdInput\" placeholder=\"e.g. Malawi\">\n      <br><br>\n      <button id=\"hostSubmitBtn\">Host Meeting</button>\n      <br>\n      <button id=\"backToChoiceBtn1\" class=\"backLink\">&larr; Back</button>\n    </div>\n\n    <div id=\"joinForm\" style=\"display:none;\">\n      <p>Enter the Meeting ID your teacher gave you</p>\n      <input type=\"text\" id=\"joinRoomIdInput\" placeholder=\"e.g. Malawi\">\n      <br><br>\n      <button id=\"joinSubmitBtn\">Join Meeting</button>\n      <br>\n      <button id=\"backToChoiceBtn2\" class=\"backLink\">&larr; Back</button>\n    </div>\n\n    <p id=\"roleSelectError\" style=\"color:#ffdd57; font-weight:600;\"></p>\n  </div>\n\n  <div id=\"mainApp\">\n    <div id=\"topBar\">\n      <h2>🎓 Classroom Live</h2>\n      <div class=\"controls\">\n        <span id=\"roomIdBadge\"></span>\n        <p id=\"status\">Not connected</p>\n        <button id=\"toggleLeftBtn\">☰ Chat & Poll</button>\n      </div>\n    </div>\n\n    <div id=\"relayNotice\">\n      📡 You've been set as a <strong>relay helper</strong> — your device will receive the teacher's audio and pass it on to a small group of other students. This uses a bit more of your data and battery than normal. Thank you for helping the class reach everyone!\n    </div>\n\n    <audio id=\"remoteAudio\" autoplay></audio>\n    <div id=\"remoteAudioContainer\"></div>\n\n    <div id=\"layout\">\n      <div id=\"leftPanel\">\n        <h3>💬 Chat</h3>\n        <div id=\"chatBox\"></div>\n        <div id=\"chatInputRow\">\n          <input type=\"text\" id=\"chatInput\" placeholder=\"Type a message...\">\n          <button id=\"sendChatBtn\">Send</button>\n        </div>\n\n        <div id=\"teacherOnlyExtras\" style=\"display:none;\">\n          <div id=\"studentsList\">Students connected: <span id=\"studentCount\">0</span></div>\n        </div>\n\n        <h3>📊 Poll</h3>\n        <div id=\"teacherPollControls\" style=\"display:none;\">\n          <input type=\"text\" id=\"pollQuestion\" placeholder=\"Poll question\">\n          <input type=\"text\" id=\"pollOption1\" placeholder=\"Option 1\">\n          <input type=\"text\" id=\"pollOption2\" placeholder=\"Option 2\">\n          <input type=\"text\" id=\"pollOption3\" placeholder=\"Option 3 (optional)\">\n          <input type=\"text\" id=\"pollOption4\" placeholder=\"Option 4 (optional)\">\n          <button id=\"createPollBtn\">Send Poll</button>\n        </div>\n\n        <div id=\"pollDisplay\" style=\"display:none;\">\n          <p id=\"pollQuestionText\" style=\"font-weight:bold;\"></p>\n          <div id=\"pollOptionsContainer\"></div>\n          <div id=\"pollResults\"></div>\n        </div>\n      </div>\n\n      <div id=\"rightPanel\">\n        <div id=\"pdfControls\">\n          <div id=\"teacherControls\" style=\"display:none;\">\n            <input type=\"file\" id=\"pdfInput\" accept=\"application/pdf\">\n          </div>\n          <button id=\"prevPage\" disabled>&laquo; Prev</button>\n          <span id=\"pageInfo\"></span>\n          <button id=\"nextPage\" disabled>Next &raquo;</button>\n        </div>\n        <canvas id=\"pdfCanvas\"></canvas>\n      </div>\n    </div>\n  </div>\n\n  <script>\n    pdfjsLib.GlobalWorkerOptions.workerSrc = \"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js\";\n\n    const WORKER_DOMAIN = \"classroom-live.emalawi19.workers.dev\";\n    const HTTP_BASE = \"https://\" + WORKER_DOMAIN;\n\n    window.onerror = function(message, source, lineno, colno, error) {\n      alert('JS ERROR: ' + message + ' (line ' + lineno + ')');\n    };\n\n    let ws;\n    let myId = null;\n    let userRole = null; // 'teacher' | 'student' | 'relay'\n    let roomId = null;\n\n    let peerConnections = new Map();\n    let localStream = null;\n    let relayStream = null;\n\n    let upstreamId = null;\n    let upstreamPc = null;\n\n    let pdfDoc = null;\n    let currentPage = 1;\n\n    let currentPoll = null;\n    let pollVotes = [];\n    let hasVoted = false;\n\n    const roleSelect = document.getElementById('roleSelect');\n    const roleChoiceButtons = document.getElementById('roleChoiceButtons');\n    const hostForm = document.getElementById('hostForm');\n    const joinForm = document.getElementById('joinForm');\n    const hostRoomIdInput = document.getElementById('hostRoomIdInput');\n    const joinRoomIdInput = document.getElementById('joinRoomIdInput');\n    const roleSelectError = document.getElementById('roleSelectError');\n\n    const mainApp = document.getElementById('mainApp');\n    const relayNotice = document.getElementById('relayNotice');\n    const teacherControls = document.getElementById('teacherControls');\n    const teacherOnlyExtras = document.getElementById('teacherOnlyExtras');\n    const studentCount = document.getElementById('studentCount');\n    const status = document.getElementById('status');\n    const roomIdBadge = document.getElementById('roomIdBadge');\n    const remoteAudioContainer = document.getElementById('remoteAudioContainer');\n    const pdfInput = document.getElementById('pdfInput');\n    const prevBtn = document.getElementById('prevPage');\n    const nextBtn = document.getElementById('nextPage');\n    const pageInfo = document.getElementById('pageInfo');\n    const canvas = document.getElementById('pdfCanvas');\n    const ctx = canvas.getContext('2d');\n    const chatBox = document.getElementById('chatBox');\n    const chatInput = document.getElementById('chatInput');\n    const sendChatBtn = document.getElementById('sendChatBtn');\n    const leftPanel = document.getElementById('leftPanel');\n    const toggleLeftBtn = document.getElementById('toggleLeftBtn');\n\n    const teacherPollControls = document.getElementById('teacherPollControls');\n    const pollQuestionInput = document.getElementById('pollQuestion');\n    const pollOption1 = document.getElementById('pollOption1');\n    const pollOption2 = document.getElementById('pollOption2');\n    const pollOption3 = document.getElementById('pollOption3');\n    const pollOption4 = document.getElementById('pollOption4');\n    const createPollBtn = document.getElementById('createPollBtn');\n    const pollDisplay = document.getElementById('pollDisplay');\n    const pollQuestionText = document.getElementById('pollQuestionText');\n    const pollOptionsContainer = document.getElementById('pollOptionsContainer');\n    const pollResults = document.getElementById('pollResults');\n\n    document.getElementById('teacherBtn').onclick = () => {\n    const pwd = prompt(\"Enter Teacher Password:\");\n    if (pwd === \"2006\") {\n      showForm('host');\n    } else {\n      roleSelectError.textContent = 'Incorrect password.';\n    }\n  };\n    document.getElementById('studentBtn').onclick = () => showForm('join');\n    document.getElementById('backToChoiceBtn1').onclick = () => showForm('choice');\n    document.getElementById('backToChoiceBtn2').onclick = () => showForm('choice');\n    document.getElementById('hostSubmitBtn').onclick = submitHost;\n    document.getElementById('joinSubmitBtn').onclick = submitJoin;\n\n    pdfInput.onchange = handlePdfSelected;\n    prevBtn.onclick = () => goToPage(currentPage - 1);\n    nextBtn.onclick = () => goToPage(currentPage + 1);\n    sendChatBtn.onclick = sendChatMessage;\n    chatInput.onkeydown = (e) => { if (e.key === 'Enter') sendChatMessage(); };\n    createPollBtn.onclick = createPoll;\n    toggleLeftBtn.onclick = () => leftPanel.classList.toggle('collapsed');\n\n    function showForm(which) {\n      roleChoiceButtons.style.display = which === 'choice' ? 'block' : 'none';\n      hostForm.style.display = which === 'host' ? 'block' : 'none';\n      joinForm.style.display = which === 'join' ? 'block' : 'none';\n      roleSelectError.textContent = '';\n    }\n\n    function connectSocket(roomIdForConnection) {\n      return new Promise((resolve) => {\n        const wsUrl = \"wss://\" + WORKER_DOMAIN + \"/ws?roomId=\" + encodeURIComponent(roomIdForConnection);\n        ws = new WebSocket(wsUrl);\n        ws.onopen = () => resolve();\n        ws.onmessage = handleSignalingMessage;\n      });\n    }\n\n    async function submitHost() {\n      const id = hostRoomIdInput.value.trim();\n      if (!id) { roleSelectError.textContent = 'Please enter a Meeting ID.'; return; }\n\n      userRole = 'teacher';\n      roleSelectError.textContent = 'Connecting...';\n\n      await connectSocket(id);\n      const trySend = () => {\n        if (myId) {\n          ws.send(JSON.stringify({ type: 'host', roomId: id }));\n        } else {\n          setTimeout(trySend, 100);\n        }\n      };\n      trySend();\n    }\n\n    async function submitJoin() {\n      const id = joinRoomIdInput.value.trim();\n      if (!id) { roleSelectError.textContent = 'Please enter a Meeting ID.'; return; }\n\n      userRole = 'student';\n      roleSelectError.textContent = 'Connecting...';\n\n      await connectSocket(id);\n      const trySend = () => {\n        if (myId) {\n          ws.send(JSON.stringify({ type: 'join-room', roomId: id }));\n        } else {\n          setTimeout(trySend, 100);\n        }\n      };\n      trySend();\n    }\n\n    function enterMainApp() {\n      roleSelect.style.display = 'none';\n      mainApp.style.display = 'block';\n      roomIdBadge.textContent = 'Meeting: ' + roomId;\n      status.textContent = 'Signaling connected. Ready.';\n\n      if (userRole === 'teacher') {\n        teacherControls.style.display = 'block';\n        teacherPollControls.style.display = 'block';\n        teacherOnlyExtras.style.display = 'block';\n        checkForExistingPdf();\n      } else {\n        teacherControls.style.display = 'none';\n        prevBtn.style.display = 'none';\n        nextBtn.style.display = 'none';\n      }\n\n      if (userRole === 'relay') {\n        relayNotice.style.display = 'block';\n        teacherOnlyExtras.style.display = 'block';\n      }\n\n      if (window.innerWidth <= 800) {\n        leftPanel.classList.add('collapsed');\n      }\n    }\n\n    async function handleSignalingMessage(msg) {\n      let data;\n      try {\n        data = JSON.parse(msg.data);\n      } catch (e) {\n        alert('Failed to parse message: ' + msg.data);\n        return;\n      }\n\n      try {\n        await handleSignalingMessageInner(data);\n      } catch (e) {\n        alert('Error handling message type \"' + data.type + '\": ' + e.message);\n      }\n    }\n\n    async function handleSignalingMessageInner(data) {\n      if (data.type === 'welcome') {\n        myId = data.id;\n        return;\n      }\n\n      if (data.type === 'error') {\n        roleSelectError.textContent = data.message;\n        status.textContent = 'Error: ' + data.message;\n        return;\n      }\n\n      if (data.type === 'hosted') {\n        roomId = data.roomId;\n        enterMainApp();\n        return;\n      }\n\n      if (data.type === 'joined-as-relay') {\n        userRole = 'relay';\n        roomId = data.roomId;\n        upstreamId = data.teacherId;\n        enterMainApp();\n        await connectUpstream();\n        return;\n      }\n\n      if (data.type === 'joined') {\n        roomId = data.roomId;\n        upstreamId = data.teacherId;\n        enterMainApp();\n        await connectUpstream();\n        return;\n      }\n\n      if (data.type === 'student-joined') {\n        if (userRole === 'teacher') {\n          await createOutgoingConnectionFor(data.id, localStream);\n        } else if (userRole === 'relay') {\n          await createOutgoingConnectionFor(data.id, relayStream);\n        }\n        updateStudentCount();\n        return;\n      }\n\n      if (data.type === 'student-left') {\n        const pcEntry = peerConnections.get(data.id);\n        if (pcEntry) {\n          pcEntry.pc.close();\n          peerConnections.delete(data.id);\n        }\n        const audioEl = document.getElementById('audio-' + data.id);\n        if (audioEl) audioEl.remove();\n        updateStudentCount();\n        return;\n      }\n\n      if (data.type === 'teacher-left') {\n        status.textContent = 'Teacher has left the meeting.';\n        return;\n      }\n\n      if (data.type === 'relay-changed') {\n      console.log(\"Relay changed, reconnecting...\");\n      if (upstreamPc) { upstreamPc.close(); upstreamPc = null; }\n      upstreamId = data.newRelayId;\n      connectUpstream();\n      return;\n    }\n    if (data.type === 'promoted-to-relay') {\n      console.log(\"Promoted to relay!\");\n      userRole = 'relay';\n      relayNotice.style.display = 'block';\n      teacherOnlyExtras.style.display = 'block';\n      if (upstreamPc) { upstreamPc.close(); upstreamPc = null; }\n      upstreamId = data.teacherId;\n      connectUpstream();\n      return;\n    }\n    if (data.type === 'relay-left') {\n        status.textContent = 'Your relay disconnected. Audio may pause until reconnected.';\n        return;\n      }\n\n      if (data.type === 'offer') {\n        const pc = getOrCreateUpstreamPc();\n        await pc.setRemoteDescription(new RTCSessionDescription(data));\n        const answer = await pc.createAnswer();\n        await pc.setLocalDescription(answer);\n        ws.send(JSON.stringify({ type: 'answer', sdp: answer.sdp, to: data.from }));\n        return;\n      }\n\n      if (data.type === 'answer') {\n        const entry = peerConnections.get(data.from);\n        if (entry) {\n          await entry.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }));\n        }\n        return;\n      }\n\n      if (data.type === 'candidate') {\n        if (userRole === 'teacher' || userRole === 'relay') {\n          const entry = peerConnections.get(data.from);\n          if (entry) {\n            await entry.pc.addIceCandidate(new RTCIceCandidate(data.candidate));\n          } else if (upstreamPc) {\n            await upstreamPc.addIceCandidate(new RTCIceCandidate(data.candidate));\n          }\n        } else {\n          if (upstreamPc) await upstreamPc.addIceCandidate(new RTCIceCandidate(data.candidate));\n        }\n        return;\n      }\n\n      if (data.type === 'pdf-ready') { fetchPdfFromServer(data.page || 1); return; }\n      if (data.type === 'pdf-page') { if (pdfDoc) renderPage(data.page, false); return; }\n      if (data.type === 'chat') { displayChatMessage(data.sender, data.text, false); return; }\n      if (data.type === 'poll-new') { receiveNewPoll(data.question, data.options); return; }\n      if (data.type === 'poll-vote') { registerVote(data.optionIndex); return; }\n      if (data.type === 'poll-results') { showResults(data.votes, data.options); return; }\n    }\n\n    function getOrCreateUpstreamPc() {\n      if (upstreamPc && upstreamPc.connectionState !== 'closed') return upstreamPc;\n      upstreamPc = new RTCPeerConnection({ iceServers: [{ urls: \"stun:stun.l.google.com:19302\" }] });\n\n      upstreamPc.addTransceiver('audio', { direction: 'recvonly' });\n\n      upstreamPc.ontrack = (event) => {\n    const stream = event.streams[0];\n    if (userRole === 'relay') {\n      relayStream = stream;\n    }\n    \n    // Play audio for BOTH relay and regular students\n    const audio = document.getElementById('remoteAudio');\n    if (audio) {\n      audio.srcObject = stream;\n      audio.muted = false;\n      const playPromise = audio.play();\n      if (playPromise !== undefined) {\n        playPromise.catch(error => {\n          console.warn(\"Autoplay blocked.\", error);\n        });\n      }\n    } else {\n      const newAudio = document.createElement('audio');\n      newAudio.autoplay = true;\n      newAudio.controls = true;\n      newAudio.srcObject = stream;\n      remoteAudioContainer.appendChild(newAudio);\n    }\n\n    status.textContent = 'Connected - audio flowing';\n    status.className = 'connected';\n  };\n\n      upstreamPc.onicecandidate = (event) => {\n        if (event.candidate && upstreamId) {\n          ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate, to: upstreamId }));\n        }\n      };\n\n      return upstreamPc;\n    }\n\n    async function connectUpstream() {\n      getOrCreateUpstreamPc();\n    }\n\n    async function createOutgoingConnectionFor(targetId, streamToSend) {\n      if (userRole === 'teacher' && !localStream) {\n        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });\n        streamToSend = localStream;\n      }\n\n      if (userRole === 'relay' && !streamToSend) {\n        await waitForRelayStream();\n        streamToSend = relayStream;\n      }\n\n      const pc = new RTCPeerConnection({ iceServers: [{ urls: \"stun:stun.l.google.com:19302\" }] });\n\n      if (streamToSend) {\n        streamToSend.getTracks().forEach(track => pc.addTrack(track, streamToSend));\n      }\n\n      pc.onicecandidate = (event) => {\n        if (event.candidate) {\n          ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate, to: targetId }));\n        }\n      };\n\n      peerConnections.set(targetId, { pc });\n\n      const offer = await pc.createOffer();\n      await pc.setLocalDescription(offer);\n      ws.send(JSON.stringify({ type: 'offer', sdp: offer.sdp, to: targetId }));\n\n      status.textContent = userRole === 'teacher' ? 'Connected - broadcasting audio' : 'Connected - relaying audio';\n      status.className = 'connected';\n    }\n\n    function waitForRelayStream() {\n      return new Promise((resolve) => {\n        const check = () => {\n          if (relayStream) resolve();\n          else setTimeout(check, 150);\n        };\n        check();\n      });\n    }\n\n    function updateStudentCount() {\n      studentCount.textContent = peerConnections.size;\n    }\n\n    function handlePdfSelected(e) {\n      const file = e.target.files[0];\n      if (!file) return;\n\n      const reader = new FileReader();\n      reader.onload = async () => {\n        const base64Data = reader.result;\n\n        await fetch(HTTP_BASE + '/upload-pdf', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ roomId: roomId, pdfData: base64Data })\n        });\n\n        loadPdfFromBase64(base64Data).then(() => {\n          renderPage(1, false);\n        });\n\n        ws.send(JSON.stringify({ type: 'pdf-ready', page: 1 }));\n      };\n      reader.readAsDataURL(file);\n    }\n\n    async function checkForExistingPdf() {\n      const res = await fetch(HTTP_BASE + '/get-pdf?roomId=' + encodeURIComponent(roomId));\n      const data = await res.json();\n      if (data.pdfData) {\n        fetchPdfFromServer(currentPage || 1);\n      }\n    }\n\n    async function fetchPdfFromServer(pageToShow) {\n      const res = await fetch(HTTP_BASE + '/get-pdf?roomId=' + encodeURIComponent(roomId));\n      const data = await res.json();\n      if (!data.pdfData) return;\n\n      loadPdfFromBase64(data.pdfData).then(() => {\n        renderPage(pageToShow, false);\n      });\n    }\n\n    function loadPdfFromBase64(base64Data) {\n      return pdfjsLib.getDocument(base64Data).promise.then((doc) => {\n        pdfDoc = doc;\n        prevBtn.disabled = false;\n        nextBtn.disabled = false;\n      });\n    }\n\n    function renderPage(pageNum, shouldBroadcast) {\n      if (!pdfDoc || pageNum < 1 || pageNum > pdfDoc.numPages) return;\n      currentPage = pageNum;\n\n      pdfDoc.getPage(pageNum).then((page) => {\n        const viewport = page.getViewport({ scale: 1.2 });\n        canvas.width = viewport.width;\n        canvas.height = viewport.height;\n\n        page.render({ canvasContext: ctx, viewport: viewport });\n        pageInfo.textContent = `Page ${currentPage} / ${pdfDoc.numPages}`;\n\n        if (shouldBroadcast && ws && ws.readyState === WebSocket.OPEN) {\n          ws.send(JSON.stringify({ type: 'pdf-page', page: currentPage }));\n        }\n      });\n    }\n\n    function goToPage(pageNum) {\n      if (userRole === 'teacher') {\n        renderPage(pageNum, true);\n      }\n    }\n\n    function sendChatMessage() {\n      const text = chatInput.value.trim();\n      if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;\n\n      const sender = userRole === 'teacher' ? 'Teacher' : 'Student';\n      displayChatMessage(sender, text, true);\n      ws.send(JSON.stringify({ type: 'chat', sender: sender, text: text }));\n      chatInput.value = '';\n    }\n\n    function displayChatMessage(sender, text, isOwnMessage) {\n      const line = document.createElement('div');\n      line.className = 'chatLine ' + (sender === 'Teacher' ? 'teacher' : 'student');\n\n      const label = document.createElement('strong');\n      label.textContent = sender;\n      line.appendChild(label);\n\n      const textSpan = document.createElement('span');\n      line.appendChild(textSpan);\n\n      chatBox.appendChild(line);\n      chatBox.scrollTop = chatBox.scrollHeight;\n\n      let i = 0;\n      const speedMs = 40;\n      const interval = setInterval(() => {\n        textSpan.textContent += text.charAt(i);\n        i++;\n        chatBox.scrollTop = chatBox.scrollHeight;\n        if (i >= text.length) clearInterval(interval);\n      }, speedMs);\n    }\n\n    function createPoll() {\n      const question = pollQuestionInput.value.trim();\n      const options = [pollOption1.value.trim(), pollOption2.value.trim(), pollOption3.value.trim(), pollOption4.value.trim()]\n        .filter(opt => opt.length > 0);\n\n      if (!question || options.length < 2) {\n        alert('Enter a question and at least 2 options.');\n        return;\n      }\n      if (!ws || ws.readyState !== WebSocket.OPEN) {\n        alert('Not connected yet.');\n        return;\n      }\n\n      currentPoll = { question, options };\n      pollVotes = new Array(options.length).fill(0);\n\n      renderPollForTeacher();\n      ws.send(JSON.stringify({ type: 'poll-new', question: question, options: options }));\n\n      pollQuestionInput.value = '';\n      pollOption1.value = '';\n      pollOption2.value = '';\n      pollOption3.value = '';\n      pollOption4.value = '';\n    }\n\n    function renderPollForTeacher() {\n      pollDisplay.style.display = 'block';\n      pollQuestionText.textContent = currentPoll.question;\n      pollOptionsContainer.innerHTML = '';\n      updateResultsDisplay();\n    }\n\n    function receiveNewPoll(question, options) {\n      currentPoll = { question, options };\n      hasVoted = false;\n\n      pollDisplay.style.display = 'block';\n      pollQuestionText.textContent = question;\n      pollOptionsContainer.innerHTML = '';\n      pollResults.innerHTML = '';\n\n      options.forEach((opt, index) => {\n        const btn = document.createElement('button');\n        btn.textContent = opt;\n        btn.onclick = () => submitVote(index);\n        pollOptionsContainer.appendChild(btn);\n      });\n    }\n\n    function submitVote(optionIndex) {\n      if (hasVoted || !ws || ws.readyState !== WebSocket.OPEN) return;\n      hasVoted = true;\n\n      Array.from(pollOptionsContainer.children).forEach(btn => btn.disabled = true);\n      pollResults.innerHTML = '<em>Vote submitted. Waiting for results...</em>';\n\n      ws.send(JSON.stringify({ type: 'poll-vote', optionIndex: optionIndex }));\n    }\n\n    function registerVote(optionIndex) {\n      if (!currentPoll || optionIndex < 0 || optionIndex >= pollVotes.length) return;\n\n      pollVotes[optionIndex]++;\n      updateResultsDisplay();\n\n      ws.send(JSON.stringify({ type: 'poll-results', votes: pollVotes, options: currentPoll.options }));\n    }\n\n    function updateResultsDisplay() {\n      const totalVotes = pollVotes.reduce((a, b) => a + b, 0);\n      pollResults.innerHTML = '';\n\n      currentPoll.options.forEach((opt, index) => {\n        const count = pollVotes[index] || 0;\n        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;\n\n        const row = document.createElement('div');\n        row.textContent = `${opt}: ${count} vote(s) (${pct}%)`;\n        pollResults.appendChild(row);\n      });\n    }\n\n    function showResults(votes, options) {\n      pollVotes = votes;\n      currentPoll = { question: currentPoll ? currentPoll.question : '', options: options };\n      updateResultsDisplay();\n    }\n  </script>\n</body>\n</html>\n";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(HTML_PAGE, { headers: { "Content-Type": "text/html" } });
    }
    if (url.pathname === "/ws") {
      const roomId = url.searchParams.get("roomId");
      if (!roomId) return new Response("Missing roomId", { status: 400 });
      const id = env.ROOMS.idFromName(roomId);
      const room = env.ROOMS.get(id);
      return room.fetch(request);
    }
    if (url.pathname === "/upload-pdf" && request.method === "POST") {
      try {
        const body = await request.json();
        if (!body.roomId || !body.pdfData) {
          return new Response(JSON.stringify({ success: false, error: "Missing roomId or pdfData" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
        await env.PDF_STORE.put(body.roomId, body.pdfData);
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: "Invalid data" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
    }
    if (url.pathname === "/get-pdf" && request.method === "GET") {
      const roomId = url.searchParams.get("roomId") || "";
      const pdfData = await env.PDF_STORE.get(roomId);
      return new Response(JSON.stringify({ pdfData: pdfData || null }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response("Not found", { status: 404 });
  }
};

export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.clients = new Map();
    this.teacherId = null;
    this.relays = [];
  }
  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    this.handleSession(server);
    return new Response(null, { status: 101, webSocket: client });
  }
  handleSession(ws) {
    const clientId = crypto.randomUUID();
    this.clients.set(clientId, { ws, role: null });
    ws.send(JSON.stringify({ type: "welcome", id: clientId }));
    ws.addEventListener("message", (event) => { this.handleMessage(clientId, event.data); });
    ws.addEventListener("close", () => { this.handleClose(clientId); });
    ws.addEventListener("error", () => { this.handleClose(clientId); });
  }
  handleMessage(clientId, raw) {
    let data;
    try { data = JSON.parse(raw); } catch (e) { return; }
    const me = this.clients.get(clientId);
    if (!me) return;

    if (data.type === "host") {
      if (this.teacherId && this.teacherId !== clientId) {
        this.send(me.ws, { type: "error", message: "A teacher is already in this room." });
        return;
      }
      this.teacherId = clientId;
      me.role = "teacher";
      this.send(me.ws, { type: "hosted", roomId: data.roomId });
      return;
    }

    if (data.type === "join-room") {
      if (!this.teacherId) {
        this.send(me.ws, { type: "error", message: "No meeting found with that ID." });
        return;
      }
      const MAX_RELAYS = 15;
      const MAX_STUDENTS_PER_RELAY = 20;
      if (this.relays.length < MAX_RELAYS) {
        me.role = "relay";
        me.assignedStudents = [];
        this.relays.push({ id: clientId, studentIds: [] });
        this.send(me.ws, { type: "joined-as-relay", roomId: data.roomId, teacherId: this.teacherId });
        const teacher = this.clients.get(this.teacherId);
        if (teacher) this.send(teacher.ws, { type: "student-joined", id: clientId });
        return;
      }
      let targetRelay = null;
      for (const relay of this.relays) {
        if (relay.studentIds.length < MAX_STUDENTS_PER_RELAY) {
          if (!targetRelay || relay.studentIds.length < targetRelay.studentIds.length) {
            targetRelay = relay;
          }
        }
      }
      if (!targetRelay) {
        this.send(me.ws, { type: "error", message: "Class is full. Please try again later." });
        return;
      }
      me.role = "student";
      me.hostId = targetRelay.id;
      targetRelay.studentIds.push(clientId);
      this.send(me.ws, { type: "joined", roomId: data.roomId, teacherId: targetRelay.id });
      const relayClient = this.clients.get(targetRelay.id);
      if (relayClient) this.send(relayClient.ws, { type: "student-joined", id: clientId });
      return;
    }

    if (data.to) {
      const target = this.clients.get(data.to);
      if (target) {
        data.from = clientId;
        this.send(target.ws, data);
      }
      return;
    }

    // --- FIXED CHAT ROUTING ---
    if (data.type === "chat") {
      if (me.role === "teacher") {
        this.relays.forEach(relay => {
          const relayClient = this.clients.get(relay.id);
          if (relayClient) this.send(relayClient.ws, data);
        });
      } else if (me.role === "relay") {
        const relay = this.relays.find(r => r.id === clientId);
        if (relay) {
          relay.studentIds.forEach(studentId => {
            const student = this.clients.get(studentId);
            if (student) this.send(student.ws, data);
          });
        }
        if (this.teacherId) {
          const teacher = this.clients.get(this.teacherId);
          if (teacher) this.send(teacher.ws, data);
        }
      } else if (me.role === "student" && me.hostId) {
        const host = this.clients.get(me.hostId);
        if (host) this.send(host.ws, data);
      }
      return;
    }

    const broadcastTypes = ["pdf-ready", "pdf-page", "poll-new", "poll-results"];
    if (broadcastTypes.includes(data.type)) {
      if (me.role === "teacher") {
        this.clients.forEach((client, id) => {
          if (id !== clientId && (client.role === "relay" || client.role === "student")) {
            this.send(client.ws, data);
          }
        });
      } else if (me.role === "relay") {
        const relay = this.relays.find(r => r.id === clientId);
        if (relay) {
          relay.studentIds.forEach((studentId) => {
            const student = this.clients.get(studentId);
            if (student) this.send(student.ws, data);
          });
        }
      } else if (me.role === "student" && me.hostId) {
        const host = this.clients.get(me.hostId);
        if (host) this.send(host.ws, data);
      }
      return;
    }

    if (data.type === "poll-vote") {
      if (me.role === "student" && me.hostId) {
        const host = this.clients.get(me.hostId);
        if (host) { data.from = clientId; this.send(host.ws, data); }
      } else if (me.role === "relay" && this.teacherId) {
        const teacher = this.clients.get(this.teacherId);
        if (teacher) { data.from = clientId; this.send(teacher.ws, data); }
      } else if (this.teacherId) {
        const teacher = this.clients.get(this.teacherId);
        if (teacher) { data.from = clientId; this.send(teacher.ws, data); }
      }
      return;
    }
  }
  
  handleClose(clientId) {
    const me = this.clients.get(clientId);
    if (!me) return;
    if (clientId === this.teacherId) {
      this.clients.forEach((client, id) => {
        if (id !== clientId) this.send(client.ws, { type: "teacher-left" });
      });
      this.teacherId = null;
    } else if (me.role === "relay") {
      // --- AUTO-FAILOVER LOGIC ---
      const relayIndex = this.relays.findIndex(r => r.id === clientId);
      if (relayIndex !== -1) {
        const disconnectedRelay = this.relays[relayIndex];
        const orphanedStudents = [...disconnectedRelay.studentIds];
        this.relays.splice(relayIndex, 1);

        for (const studentId of orphanedStudents) {
          const student = this.clients.get(studentId);
          if (!student) continue;

          let newTargetRelay = null;
          for (const r of this.relays) {
            if (r.studentIds.length < 20) {
              if (!newTargetRelay || r.studentIds.length < newTargetRelay.studentIds.length) {
                newTargetRelay = r;
              }
            }
          }

          if (newTargetRelay) {
            student.hostId = newTargetRelay.id;
            newTargetRelay.studentIds.push(studentId);
            this.send(student.ws, { type: "relay-changed", newRelayId: newTargetRelay.id });
            const newRelayClient = this.clients.get(newTargetRelay.id);
            if (newRelayClient) this.send(newRelayClient.ws, { type: "student-joined", id: studentId });
          } else {
            student.role = "relay";
            student.hostId = null;
            this.relays.push({ id: studentId, studentIds: [] });
            this.send(student.ws, { type: "promoted-to-relay", teacherId: this.teacherId });
            if (this.teacherId) {
              const teacher = this.clients.get(this.teacherId);
              if (teacher) this.send(teacher.ws, { type: "student-joined", id: studentId });
            }
          }
        }
      }
      if (this.teacherId) {
        const teacher = this.clients.get(this.teacherId);
        if (teacher) this.send(teacher.ws, { type: "student-left", id: clientId });
      }
    } else if (me.role === "student" && me.hostId) {
      const relay = this.relays.find(r => r.id === me.hostId);
      if (relay) {
        relay.studentIds = relay.studentIds.filter(id => id !== clientId);
      }
      const host = this.clients.get(me.hostId);
      if (host) this.send(host.ws, { type: "student-left", id: clientId });
    }
    this.clients.delete(clientId);
  }
  send(ws, obj) {
    try { ws.send(JSON.stringify(obj)); } catch (e) {}
  }
}
