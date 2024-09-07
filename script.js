// スタートを押すと、希望するタイプを選択できるようにする
$('.opt_box').click(function() {
    // 他のすべてのオプションボックスから 'selected' クラスを削除
    $('.opt_box').removeClass('selected');
    // クリックされたオプションボックスに 'selected' クラスを追加
    $(this).addClass('selected');
});

function startConversation() {
    var responseStyle = $('.selected').data('style');
   var prompt = "";

   switch (responseStyle) {
       case "supportive":
           prompt = "あなたは親しみやすく、支援的なカウンセラーです。ユーザーの感情を理解し、励ましと共感をもってゆっくりと導いてください。安心感を与えながら、穏やかなコミュニケーションでアドバイスをしてください。";
           break;
       case "educational":
           prompt = "あなたは情報を提供し、教育的なアドバイスをするカウンセラーです。明確な支持と教育的なアドバイスを通じて、何をするべきかを教えます。目標達成にむけた具体的なステップの提供とともにアドバイスをお願いします。";
           break;
       case "passionate":
           prompt = "あなたは情熱的なカウンセラーです。目標達成にむけてポジティブな刺激を提供します。ユーザーに感情を込めて、エネルギッシュに応答してください。";
           break;
       case "rational":
           prompt = "あなたは合理的で論理的なカウンセラーです。論理的説明と事実に基づいたアドバイスで納得のいく解決策を導きます。冷静かつ論理的なアプローチで応答してください。";
           break;
        default:
            alert('応答スタイルを選択してください');
            return;
   }

   messageHistory.push({ role: 'user', content: prompt });
   sendMessageToAPI(messageHistory)
   // ここでプロンプトをAPIに送信し、ボットの応答を取得するコードを記述
   console.log("Prompt to AI:", prompt);
  

   async function sendMessageToAPI(messageHistory) {
    const url = 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ""'
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messageHistory
        })
    });

    if (!response.ok) {
        console.error('Error:', await response.text());
        return;
    }

    const data = await response.json();
    // 応答があるが、それを表示または処理しない
    console.log('Response received, but it will be ignored.');
}


}
let messageHistory = []; //メッセージを格納する

// ページを読み込み初期メッセージを出現させる
$(document).ready(function(){
const initialMessages = [
{ role:'system',
content:'こんにちは、あなたのキャリアアドバイザーとして相談にのります。何について話しますか？'}
];
initialMessages.forEach((message) => {
$('#chat-history').append('<p class"'+ message.role +'">'+ message.content + '</p>');
messageHistory.push(message);
$('#chat-history').fadeIn(1000);
});
});

async function appendAssistantResponse(assistantMessage) {
messageHistory.push({ 'role': 'assistant', 'content': assistantMessage });
}

// 送信ボタンを押して、userとassinstantのメッセージを出現させる
$('#chat-input').keypress( async function (event) {
if (event.keyCode !== 13 ) return  
event.preventDefault();
const userMessage = $('#chat-input').val(); //.val()はjQueryの値を取得するメソッド
$('#chat-history').append('<p class="you">' + userMessage + '</p>'); 
messageHistory.push({ 'role': 'user', 'content': userMessage });

const formData = $(this).serialize();
const url = 'https://api.openai.com/v1/chat/completions';
const response = await fetch(url, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': 'Bearer ""',
},
body: JSON.stringify({
'model': 'gpt-4o-mini' ,
'stream': true,
'max_tokens': 100, //生成されるトークン数を制限
'temperature':0.5,
'messages': messageHistory,
}),
});

if (!response.ok) {
console.error('Error:', await response.text());
return;
}

$("#chat-input").val("");
$("#chat-input").focus();

const reader = response.body.getReader();
const textDecoder = new TextDecoder();
let buffer = '';

while (true) {
const { value, done } = await reader.read();

if (done) {
break;
}

buffer += textDecoder.decode(value, { stream: true });

while (true) {
const newlineIndex = buffer.indexOf('\n');
if (newlineIndex === -1) {
 break;
}

const line = buffer.slice(0, newlineIndex);
buffer = buffer.slice(newlineIndex + 1);

if (line.startsWith('data:')) {

 if (line.includes('[DONE]')) {
   $('#chat-history').append('<hr>');
   return;
 }

 const jsonData = JSON.parse(line.slice(5));

 if (jsonData.choices && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
   const assistantMessage = jsonData.choices[0].delta.content;
   $('#chat-history').append('<span class="assistant">' + assistantMessage + '</span>');　
   await appendAssistantResponse(assistantMessage);
   $('#description-box').fadeOut(1000);
   $('#chat-input').val('');
 }

}
}
}
});

const chatWindow = document.getElementById('chat-window');
function scrollChatWindow() {
const chatWindowHeight = chatWindow.clientHeight;
const chatWindowScrollHeight = chatWindow.scrollHeight;
const chatWindowTextHeight = chatWindowScrollHeight - chatWindow.scrollTop;
if (chatWindowTextHeight > chatWindowHeight) {
chatWindow.scrollTop = chatWindowScrollHeight;
}
}
// chatWindow.addEventListener('DOMNodeInserted', scrollChatWindow);
// MutationObserverのコールバック関数
const observerCallback = function(mutationsList, observer) {
    for(let mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // 子ノードが追加されたときの処理
            const chatWindowHeight = chatWindow.clientHeight;
            const chatWindowScrollHeight = chatWindow.scrollHeight;
            if (chatWindow.scrollHeight - chatWindow.scrollTop > chatWindow.clientHeight) {
                chatWindow.scrollTop = chatWindowScrollHeight;
            }
        }
    }
};

// MutationObserverの設定
const config = { childList: true };  // 子ノードの変更を監視

// MutationObserverのインスタンスを生成
const observer = new MutationObserver(observerCallback);

// 監視を開始
observer.observe(chatWindow, config);



const recognition = new webkitSpeechRecognition(); // prefix 必要 SpeechRecognition
recognition.lang = "ja";
recognition.continuous = false;  // 連続認識を無効にする
recognition.interimResults = false;
// recognition.onresult を更新して、認識結果をAPIに送信
recognition.onresult = function(event) {
   var transcript = event.results[0][0].transcript; // 認識されたテキストを取得

   // テキスト入力フィールドにテキストを設定
   $('#chat-input').val(transcript);

   // チャット履歴にテキストを追加
   $('#chat-history').append($('<p>').addClass('user').text(transcript));
   $('#chat-history').show(); // チャット履歴が非表示の場合は表示

   // メッセージ履歴にユーザーメッセージを追加
   messageHistory.push({ 'role': 'user', 'content': transcript });

   // APIにメッセージ履歴を送信する
   sendMessageToAPI(messageHistory);
};

// sendMessageToAPI関数でAPIに送信し、応答を取得
async function sendMessageToAPI(messageHistory) {
   const url = 'https://api.openai.com/v1/chat/completions';
   const response = await fetch(url, {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json',
           'Authorization': 'Bearer ""',
       },
       body: JSON.stringify({
           'model': 'gpt-3.5-turbo',
           'stream': true,
           'messages': messageHistory,
       }),
   })


   if (!response.ok) {
       console.error('Error:', await response.text());
       return;
   }

   const reader = response.body.getReader();
   const textDecoder = new TextDecoder();
   let buffer = '';

   while (true) {
       const { value, done } = await reader.read();
       if (done) {
           break;
       }
       buffer += textDecoder.decode(value, { stream: true });

       while (true) {
           const newlineIndex = buffer.indexOf('\n');
           if (newlineIndex === -1) {
               break;
           }

           const line = buffer.slice(0, newlineIndex);
           buffer = buffer.slice(newlineIndex + 1);

           if (line.startsWith('data:')) {
               if (line.includes('[DONE]')) {
                   $('#chat-history').append('<hr>');
                   return;
               }

               const jsonData = JSON.parse(line.slice(5));
               if (jsonData.choices && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                   const assistantMessage = jsonData.choices[0].delta.content;
                   $('#chat-history').append('' + assistantMessage + ''); //GPTの応答を表示する処理
                   appendAssistantResponse(assistantMessage);
                   $('#description-box').fadeOut(1000);
                   $('#chat-input').val('');
               }
           }
       }
   }
}

// 最後に認識されたテキストを保持する変数
let lastRecognized = "";
let isRecognitionActive = false; // 音声認識の状態を追跡するフラグ

recognition.onresult = function(event) {
    var transcript = event.results[0][0].transcript; // 認識されたテキストを取得
    if (transcript.trim() !== lastRecognized.trim()) { // 前回の認識結果と異なる場合のみ処理
        lastRecognized = transcript; // 認識されたテキストを更新
        $('#chat-input').val(transcript); // テキスト入力フィールドにテキストを設定
        $('#chat-history').append($('<p>').addClass('user').text(transcript)); // チャット履歴にテキストを追加
        $('#chat-history').show(); // チャット履歴が非表示の場合は表示
        messageHistory.push({ 'role': 'user', 'content': transcript }); // メッセージ履歴にユーザーメッセージを追加
        sendMessageToAPI(messageHistory); // APIにメッセージ履歴を送信する
    }
};

recognition.onend = function() {
   console.log("Recognition ended.");
   if (isRecognitionActive) {  // フラグが true の場合のみ再開
       recognition.start();
       console.log("Recognition restarted.");
   }
};

$(document).ready(function() {
    var isRecognitionActive = false; // 音声認識の状態を追跡するフラグ

    $('#toggle-recognition').click(function() {
        if (!isRecognitionActive) {
            recognition.start(); // 音声認識を開始
            isRecognitionActive = true; // 状態をアクティブに変更
            $(this).html('<i class="fa-solid fa-microphone-slash fa-xl"></i>'); // ボタンのテキストとアイコンを変更
        } else {
            recognition.stop(); // 音声認識を停止
            isRecognitionActive = false; // 状態を非アクティブに変更
            $(this).html('<i class="fa-solid fa-microphone fa-xl" style="color: #2bc3c3;"></i>'); // ボタンのテキストとアイコンを元に戻す
        }
    });

    recognition.onend = function() {
        // 音声認識が自然に停止した場合もボタンの状態を更新
        if (isRecognitionActive) {
            recognition.start(); // ボタンの状態を切り替え
        }
    };
});

$(document).ready(function() {
    $('.opt_box').click(function() {
        var description = $(this).data('description');  // data-description属性から説明を取得
        $('#description-box').html(description).fadeIn();  // 説明ボックスにテキストを設定し、表示
    });
});
