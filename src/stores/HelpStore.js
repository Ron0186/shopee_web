import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useHelpStore = defineStore("help", () => {
    const searchQuery = ref("");
    const selectedArticleId = ref(null);
    const faqCategories = ref([
        {
            id: 1,
            title: "訂單與付款",
            items: [
                { id: "q1-1", question: "如何查看我的訂單狀態？", answer: "請登入您的帳戶後，進入「我的訂單」頁面，您可以查看所有過去的訂單以及其當前狀態。每個訂單旁邊會有狀態顯示，例如：待處理、已發貨、已完成等。如果您的訂單有更新，系統會即時顯示。您還可以在訂單頁面找到每個訂單的詳細訊息，並能夠追蹤物流狀態。如果有任何問題，請隨時聯繫客服以獲取協助。" },
                { id: "q1-2", question: "有哪些付款方式？", answer: "我們目前支持多種付款方式，包括信用卡、PayPal、銀行轉帳以及部分地區的數位錢包支付。信用卡支付支持主流的信用卡品牌，例如Visa、MasterCard等，您只需在結帳時選擇信用卡作為支付方式，並輸入您的信用卡訊息即可完成付款。若您選擇PayPal付款，系統會引導您登入PayPal帳戶進行支付，保證交易的安全性。除此之外，我們也提供銀行轉帳選項，您可以根據提示將款項轉入指定銀行帳號，轉帳完成後，請將轉帳憑證上傳以便確認付款。" },
                { id: "q1-3", question: "訂單付款後，多久會發貨？", answer: "通常情況下，在您完成訂單付款後，我們會在 1-2 個工作日內處理並發貨。具體的發貨時間取決於您的訂單內容、庫存狀況以及配送地點。如果是定製商品，可能會需要更長的處理時間。我們會在訂單處理過程中發送通知，告訴您包裹何時發貨以及提供追蹤號碼，您可以在您的帳戶中查看詳細的發貨訊息。" },
                { id: "q1-4", question: "訂單付款後可以更改地址嗎？", answer: "如果您的訂單尚未發貨，我們可以協助您更改收貨地址。您可以在訂單詳情頁面提交變更地址的請求，並提供新的收貨地址。請注意，一旦訂單進入發貨流程，我們就無法再進行地址更改。如果您發現訂單已發貨並且需要更改地址，請儘快聯繫客服，我們將協助您聯繫物流公司進行地址更新，但這並不一定能成功。" },
                { id: "q1-5", question: "如何取消我的訂單？", answer: "如果您希望取消訂單，請確保訂單尚未發貨。在訂單詳情頁面，您會看到一個取消訂單的選項。如果您成功取消訂單，系統會即刻處理並退還您的付款。若訂單已經發貨，我們無法直接取消訂單，但您可以選擇在收到商品後進行退貨處理。退貨需要遵循我們的退貨政策，並且必須在一定的時間範圍內進行。" }
            ]
        },
        {
            id: 2,
            title: "帳戶管理",
            items: [
                { id: "q2-1", question: "如何修改我的帳戶資訊？", answer: "登入後，您可以進入「我的帳戶」頁面，然後選擇「帳戶設定」來修改您的個人資訊。在此頁面中，您可以修改您的聯繫方式（如電子郵件、電話號碼等），以及更新您的地址訊息。所有修改都會即時生效，並且您可以隨時查看或更改您帳戶中的資料。若您修改了登錄郵箱地址，請注意系統會發送確認郵件以確保變更的安全性。" },
                { id: "q2-2", question: "我忘記密碼，該怎麼辦？", answer: "如果您忘記了帳戶密碼，您可以點擊登入頁面的「忘記密碼？」鏈接，然後輸入您的註冊郵箱地址。我們將向您的郵箱發送重置密碼的郵件。打開郵件中的連結後，您將能夠設置一個新的密碼。請確保新設置的密碼具有較高的安全性，例如包含大寫字母、數字和特殊符號。完成後，您可以使用新密碼登入帳戶。如果您遇到任何問題，可以聯繫客服進行協助。" },
                { id: "q2-3", question: "如何刪除我的帳戶？", answer: "若您希望刪除帳戶，請注意這是不可逆的操作，刪除後您將無法再使用該帳戶登錄或找回相關資料。如果您確定要刪除帳戶，請聯繫我們的客服團隊，我們將協助您處理帳戶刪除的請求。刪除帳戶後，與該帳戶相關的所有資料將被永久刪除，無法恢復。若您僅是暫時不使用帳戶，也可以選擇停用帳戶。" },
                { id: "q2-4", question: "帳戶被封鎖，怎麼辦？", answer: "如果您的帳戶被封鎖，這可能是由於違反了我們的使用條款或其他安全問題所引起的。您將會收到我們發出的通知，詳細說明封鎖的原因。如果您認為封鎖是錯誤的，可以提交申訴請求，我們的客服團隊會進行調查並通知您結果。在此期間，請勿嘗試使用其他方式繞過封鎖，這可能會導致您的帳戶被永久封禁。" },
                { id: "q2-5", question: "如何更新我的支付資訊？", answer: "登入帳戶後，進入「支付設置」頁面，您可以更新您的信用卡或其他支付方式訊息。此處支持添加新的支付方式，也可以更新現有的卡號、過期日期等訊息。每次更新支付資訊後，系統會發送確認郵件，請檢查您的郵箱確保資料已更新成功。注意，所有支付訊息都經過加密處理，以保障您的帳戶安全。" }
            ]
        },
        {
            id: 3,
            title: "運送與配送",
            items: [
                { id: "q3-1", question: "我的包裹多久能送達？", answer: "根據您的配送地點，正常情況下包裹會在 3-5 個工作日內送達。若您位於偏遠地區或國際配送，運送時間可能會更長。當我們發貨後，您將收到一封包含追蹤號碼的郵件，您可以使用該號碼查詢包裹的實時位置。若包裹未按時送達，您可以聯繫客服進行查詢，我們會協助您追蹤包裹並提供更多訊息。" },
                { id: "q3-2", question: "是否提供國際配送？", answer: "是的，我們支持國際配送。您可以在結帳時選擇您的國家/地區，我們會根據您的地址提供相應的運費和配送選項。不同國家/地區的配送時間和費用會有所不同，具體訊息您可以在結帳頁面查看。對於一些特殊地區，我們也提供快遞選項，您可以選擇更快的配送方式。" },
                { id: "q3-3", question: "是否提供加急配送服務？", answer: "我們提供加急配送選項，您可以在結帳時選擇相應的加急服務，通常會在 1-2 個工作日內送達。加急配送的費用會根據您的配送地點和商品重量有所不同。在某些地區，可能會有額外的運送費用或條件，具體費用會在結帳時顯示。" },
                { id: "q3-4", question: "配送過程中包裹損壞怎麼辦？", answer: "如果在運送過程中包裹損壞，請立即聯繫我們的客服團隊。您需要提供損壞包裹的照片，以及您的訂單號。收到您的報告後，我們將進行調查並根據情況提供退貨、換貨或退款等處理方案。" },
                { id: "q3-5", question: "如何修改配送地址？", answer: "若您的訂單尚未發貨，您可以直接修改配送地址。請登入您的帳戶，進入「我的訂單」，然後選擇未發貨的訂單並更新配送地址。如果訂單已經發貨，您可以聯繫我們的客服，我們將協助您與配送公司聯繫進行地址更新。" }
            ]
        },
        {
            id: 4,
            title: "退換貨問題",
            items: [
                { id: "q4-1", question: "如何進行退貨？", answer: "如果您希望退貨，首先請確保商品符合退貨條件，例如商品未使用過，包裝完好無損，並且在退貨期限內。您可以登入帳戶並進入訂單詳情頁面，選擇需要退貨的商品，然後點擊「申請退貨」按鈕，填寫相關退貨訊息，包括退貨原因和退貨方式。提交申請後，我們的客服團隊會進行審核，並提供退貨的具體操作指引。若您的退貨申請被批准，請將商品及其原包裝寄回，我們收到商品後會進行退款處理。" },
                { id: "q4-2", question: "可以退換所有商品嗎？", answer: "並非所有商品都可以退換。部分商品，如定製商品、開封過的衛生用品等，由於衛生或個人化原因，不適用退換政策。具體商品的退換規定可以在商品頁面查詢，通常會在商品描述中標註是否可以退換。如果您不確定某個商品是否可以退換，請聯繫我們的客服部門，客服將根據具體情況提供幫助。" },
                { id: "q4-3", question: "退貨處理需要多久？", answer: "退貨處理的時間通常為 7-14 個工作日，具體時間取決於退貨商品的狀況以及我們收到商品的時間。當我們收到退回的商品後，會對商品進行檢查，確認商品是否符合退貨條件。如果商品符合要求，我們會在 3-5 個工作日內進行退款處理。退款方式會依照您的原付款方式進行，例如如果您使用信用卡付款，退款將退回至您的信用卡帳戶。" },
                { id: "q4-4", question: "如何退換過季商品？", answer: "過季商品的退換處理與正常商品相同，只要商品符合我們的退貨政策，就可以進行退換。請注意，過季商品的庫存可能較為有限，若您選擇換貨，可能無法換取相同款式或顏色。若您想退貨，請依照正常流程申請退貨，並根據客服提供的指引寄回商品。我們收到商品並確認符合退貨條件後會進行退款處理。" },
                { id: "q4-5", question: "如何處理退貨時的運費？", answer: "退貨時的運費將根據退貨的原因來決定。如果是由於我們的錯誤（例如發錯商品或商品損壞），我們會承擔退貨運費。若是您改變主意或不滿意商品，則需自費支付退貨運費。請在退貨前與我們的客服聯繫，了解具體的運費政策，我們將根據情況給您提供最合適的退貨方案。" }
            ]
        },
        {
            id: 5,
            title: "折扣與優惠",
            items: [
                { id: "q5-1", question: "如何使用優惠碼？", answer: "在結帳頁面，您會看到一個輸入優惠碼的欄位。當您有優惠碼時，請在該欄位中輸入您的優惠碼，並點擊「應用」按鈕。系統會自動計算並顯示您的折扣金額。請確保您輸入的優惠碼正確無誤，並且符合使用條件。某些優惠碼有時間限制，請在有效期內使用。如果您遇到任何問題，請隨時聯繫我們的客服團隊，將會協助您解決。" },
                { id: "q5-2", question: "是否有會員折扣？", answer: "是的，我們為註冊並登錄帳戶的會員提供專屬折扣。這些折扣通常會在結帳時自動顯示，或在特定的會員活動期間提供優惠。會員還可以享受定期的促銷活動，獲得額外的折扣或優惠。若您是會員且沒有看到折扣，請確保您已登入帳戶，並確認您的會員資格是否符合當前的優惠條件。" },
                { id: "q5-3", question: "購物滿額有優惠嗎？", answer: "是的，我們有時會推出滿額折扣活動。例如，購物滿一定金額即可享有折扣或免運費。我們會定期在網站上公告這些活動，並提供具體的優惠條件。您可以查看「促銷活動」頁面或訂閱我們的電子報，隨時掌握最新的滿額優惠訊息。如果您滿足條件，優惠將自動應用於您的結帳頁面。" },
                { id: "q5-4", question: "促銷活動如何參加？", answer: "參加促銷活動的方法通常會在我們的網站或電子報中公佈。大多數活動都會提供清楚的參加規則，您只需要根據規定的條件進行購買即可。某些活動可能需要輸入優惠碼，或者在特定的時間段內下單才能參與。請務必在活動期間內參加，過期則無效。您可以查看活動頁面上的詳細條件，也可以聯繫客服詢問活動詳情。" },
                { id: "q5-5", question: "如何知道我是否符合折扣條件？", answer: "每個折扣或優惠都有具體的條件，這些條件通常會在優惠頁面或結帳頁面顯示。您可以仔細閱讀這些條件，確認自己是否滿足要求。例如，某些優惠可能僅限新會員或特定商品，某些活動則要求最低消費金額。當您進行結帳時，系統會自動檢查您是否符合條件並顯示相應的折扣。如果有任何疑問，您可以聯繫客服了解更多詳情。" }
            ]
        },
        {
            id: 6,
            title: "安全與隱私",
            items: [
                { id: "q6-1", question: "我的個人資料是否安全？", answer: "我們非常重視您的隱私與資料安全。所有個人資料都會經過加密處理，並且只會用於處理您的訂單或為您提供更好的服務。我們不會將您的個人資料出售或透露給第三方，除非是為了法律合規或服務提供的需要。您可以在我們的隱私政策中查看更詳細的資料保護措施，確保您了解我們如何處理您的資料。" },
                { id: "q6-2", question: "網站使用 cookies 嗎？", answer: "是的，我們網站使用 cookies 來提高您的瀏覽體驗。cookies 是小型文本文件，用來存儲您的偏好設置、登入狀態及其他有助於提升網站功能的訊息。我們會根據您的同意來使用這些 cookies，您可以在瀏覽器中設置是否接受 cookies。如果您選擇禁用 cookies，網站的部分功能可能無法正常使用。" },
                { id: "q6-3", question: "如何保護我的帳戶安全？", answer: "為了保護您的帳戶安全，我們建議您使用強密碼，包括大寫字母、小寫字母、數字以及特殊符號，並定期更換密碼。避免將帳戶訊息透露給他人，並請小心防範釣魚網站或假冒網站。若您發現帳戶異常活動，請立即更改密碼並聯繫我們的客服部門進行處理。" },
                { id: "q6-4", question: "是否提供兩步驟驗證？", answer: "為了進一步保障您的帳戶安全，我們提供兩步驟驗證功能。啟用此功能後，除了輸入密碼外，您還需輸入發送到您註冊手機或電子郵件中的驗證碼。這樣即使您的密碼被盜，沒有正確的驗證碼也無法登入您的帳戶。您可以在帳戶設定頁面啟用此功能，並根據需要設置驗證方式。" },
                { id: "q6-5", question: "網站是否會分享我的資料給第三方？", answer: "我們承諾不會將您的個人資料出售給第三方。然而，為了提供服務或符合法律要求，我們可能會與某些第三方共享您的資料。這些第三方包括我們的物流合作夥伴、支付服務提供商等，僅限於處理您的訂單和提供服務所需的訊息。所有第三方服務商都會遵守我們的隱私政策，以確保您的資料得到妥善保護。" }
            ]
        },
        {
            id: 7,
            title: "配送與運送",
            items: [
                { id: "q7-1", question: "配送需要多長時間？", answer: "配送時間通常取決於您的地理位置和選擇的配送方式。標準配送一般需要 3-7 個工作日，而加急配送則會在 1-3 個工作日內送達。請注意，某些偏遠地區的配送時間可能會更長。您可以在結帳時選擇不同的配送選項，並查看每個選項的預計送達時間。若您需要特定的送貨時間，可以選擇預約配送或使用定時送貨服務。" },
                { id: "q7-2", question: "是否支持國際配送？", answer: "是的，我們提供國際配送服務。目前支持多個國家的配送，並且根據目的地不同，配送時間和費用也會有所不同。在結帳時，系統會根據您的收貨地址顯示可選的國際配送方式及其預計送達時間和運費。請注意，部分地區可能會受到進口限制或海關規定影響，詳細訊息請查閱我們的國際配送政策或聯繫客服。" },
                { id: "q7-3", question: "如何查詢我的訂單狀態？", answer: "您可以登入您的帳戶，並進入「我的訂單」頁面查看訂單的最新狀態。每個訂單旁邊都會顯示配送狀態，例如「已處理」、「已發貨」、「正在運送」等。您也可以點擊訂單詳細訊息，查看跟踪號碼，並在運送公司網站上進行實時跟踪。如果您對訂單狀態有任何疑問，請隨時聯繫我們的客服部門，我們將提供幫助。" },
                { id: "q7-4", question: "如果我的商品遺失怎麼辦？", answer: "如果您的商品在配送過程中遺失，請立即與我們的客服聯繫。我們會根據運送公司的調查結果提供賠償或重發商品。遺失情況通常由物流公司負責處理，但我們會與物流公司密切合作，以確保您獲得滿意的解決方案。如果您的商品在運送途中損壞或丟失，我們會在您提供必要的證據後進行補償或重新發貨。" },
                { id: "q7-5", question: "如何選擇配送方式？", answer: "在結帳時，您可以選擇不同的配送方式。一般來說，您可以選擇標準配送、加急配送或定時配送等選項。每種配送方式的預計送達時間和費用會在選擇過程中顯示。標準配送是最經濟的選項，但需要較長的配送時間；加急配送適合需要快速送達的情況，雖然會有較高的費用；定時配送則可以確保商品在特定的時間內送達您指定的地址。" }
            ]
        },
        {
            id: 8,
            title: "帳戶管理",
            items: [
                { id: "q8-1", question: "如何註冊新帳戶？", answer: "註冊新帳戶非常簡單，您只需要提供有效的電子郵件地址，並設置一個安全的密碼。點擊網站上的「註冊」按鈕，填寫必要的個人訊息，然後確認您的電子郵件地址即可完成註冊。您也可以選擇使用社交媒體帳戶進行快速註冊。一旦完成註冊，您將可以使用帳戶來查看訂單歷史、保存購物車並享受會員專屬優惠。" },
                { id: "q8-2", question: "忘記密碼該怎麼辦？", answer: "如果您忘記了密碼，可以在登入頁面點擊「忘記密碼」選項，系統將會發送一封密碼重設郵件到您的註冊電子郵件地址。請按照郵件中的指示操作，設置一個新的密碼。為了帳戶的安全性，我們建議您選擇一個強密碼並且不與其他帳戶重複使用。如果您仍然無法重設密碼，請聯繫我們的客服，我們將協助您找回帳戶。" },
                { id: "q8-3", question: "如何刪除我的帳戶？", answer: "若您決定刪除帳戶，請先確保您不再有任何未處理的訂單或積分。刪除帳戶的請求可以通過客服提交，我們將進行審核並處理。刪除帳戶後，您的所有個人資料將被永久刪除，無法恢復，因此請謹慎操作。如果您僅是希望停用帳戶，也可以選擇暫時停用帳戶而不是刪除。請聯繫客服了解更多詳情。" },
                { id: "q8-4", question: "如何更改帳戶的電子郵件地址？", answer: "如果您需要更改帳戶的電子郵件地址，請登入您的帳戶，進入「帳戶設定」頁面。在此頁面中，您將看到可以修改電子郵件的選項。輸入新的電子郵件地址後，系統將發送驗證郵件至新地址，請按照郵件中的指示完成驗證。如果您無法更改郵件地址，請聯繫客服部門，我們將提供協助。" },
                { id: "q8-5", question: "如何更新帳戶訊息？", answer: "要更新您的帳戶訊息，請登入帳戶後進入「我的帳戶」頁面。在此頁面中，您可以修改聯絡地址、手機號碼、支付方式等個人訊息。請注意，部分敏感訊息（如電子郵件、密碼）需要經過額外的安全步驟才能進行更新。如果您在更新過程中遇到問題，隨時可以聯繫我們的客服團隊進行協助。" }
            ]
        },
        {
            id: 9,
            title: "技術支持",
            items: [
                { id: "q9-1", question: "如何重置我的應用程式設置？", answer: "如果您需要重置應用程式設置，您可以進入「設置」頁面並選擇「重置設定」選項。這將會恢復應用程式的所有默認設置，並刪除所有個人化設定。請注意，這樣操作會清除所有先前保存的偏好和資料。如果您只是希望更改某些特定設置，您可以單獨調整需要更改的項目而不需要進行完全重置。" },
                { id: "q9-2", question: "我的應用程式無法啟動，該怎麼辦？", answer: "如果您的應用程式無法啟動，請首先嘗試重新啟動您的設備。有時候，重啟設備可以解決暫時的軟體故障。如果問題依然存在，您可以嘗試卸載並重新安裝應用程式，這有助於修復損壞的檔案或更新版本。如果這些方法無效，請聯繫我們的技術支持團隊，我們會進行進一步的診斷並提供解決方案。" },
                { id: "q9-3", question: "如何報告應用程式錯誤？", answer: "您可以在應用程式內部的「幫助與支持」區域找到「報告錯誤」選項，點擊進入後填寫錯誤的詳細訊息，包括錯誤描述、發生時間和您的設備訊息。我們的技術團隊會收到您的報告並進行分析，並儘快處理該問題。如果您遇到緊急問題，請隨時聯繫我們的客服，並提供錯誤的詳情，我們將提供即時支持。" },
                { id: "q9-4", question: "如何更新我的應用程式版本？", answer: "要更新應用程式版本，請前往您的設備應用商店（例如 Apple App Store 或 Google Play Store）。在該商店中，查找您的應用程式並查看是否有可用的更新。如果有更新，請點擊「更新」按鈕並等待下載完成。如果您的應用程式已經是最新版本，則會顯示「已安裝」字樣。如果您遇到更新問題，請聯繫我們的技術支持。" },
                { id: "q9-5", question: "如何查看應用程式的使用說明？", answer: "應用程式內有詳細的使用說明，您可以在「幫助與支持」區域找到常見問題和操作指南。若您需要更詳細的使用說明，也可以訪問我們的官方網站，該網站上有完整的使用手冊和視頻教程。這些資料將幫助您更快掌握應用程式的所有功能。如果您有任何具體的使用問題，也可以直接聯繫我們的客服團隊。" }
            ]
        },
        {
            id: 10,
            title: "維修與保養",
            items: [
                { id: "q10-1", question: "如何為我的商品申請維修？", answer: "如果您的商品需要維修，請先確認保修期內的服務條款。若符合保修條件，您可以聯繫我們的客服團隊申請維修。我們會要求您提供購買證明及故障詳細描述，並提供寄送維修的地址和流程。收到您的商品後，我們的維修技術人員會進行檢查，並提供修復或更換方案。維修過程中，我們會隨時通知您進展。" },
                { id: "q10-2", question: "是否提供上門維修服務？", answer: "部分商品支持上門維修服務，這取決於商品的類型和您的地理位置。如果您的商品符合條件，並且服務範圍內，我們會安排專業維修人員上門為您提供維修服務。您可以在客服申請時詢問是否支持上門維修，並確認具體細節。如果您選擇其他維修方案，我們也提供郵寄維修服務。" },
                { id: "q10-3", question: "維修期間我是否需要支付費用？", answer: "在保修期內，若是因為產品質量問題所導致的維修，我們將免除維修費用。但是如果維修問題是由於使用不當或非正常損壞所引起，則可能需要支付一定的維修費用。具體費用會根據維修的項目和更換的部件而定。在維修前，我們會提供詳細的費用估算，並且在您同意後才會進行維修。" },
                { id: "q10-4", question: "如何清潔與保養我的商品？", answer: "不同的商品需要不同的保養方式。一般來說，請參照商品附帶的使用手冊或產品頁面上的保養建議來維護您的商品。例如，電子產品應避免長時間曝曬、保持清潔並定期檢查，家電產品則需按照使用頻率定期清潔濾網和內部元件。如果您不確定如何保養您的商品，請隨時聯繫我們的客服，我們會提供具體的保養建議。" },
                { id: "q10-5", question: "商品保固期是多久？", answer: "商品的保修期會根據品牌和商品類型不同而有所不同。一般來說，大部分商品提供 1 年保修期，但部分高價值或特殊商品，如家電產品，可能提供更長的保修期。您可以在商品頁面查看具體的保修期，或者在購買後查閱發票和保修卡。如果您的商品在保修期內出現問題，我們會根據保修條款提供免費維修或更換服務。" }
            ]
        }
    ]);

    const filteredFAQs = computed(() => {
        if (!searchQuery.value) return [];
        return faqCategories.value
            .map(category => ({
                ...category,
                items: category.items.filter(item => item.question.includes(searchQuery.value))
            }))
            .filter(category => category.items.length > 0);
    });

    const setSearchQuery = query => (searchQuery.value = query);
    const setSelectedArticle = id => (selectedArticleId.value = id);

    return { searchQuery, selectedArticleId, faqCategories, filteredFAQs, setSearchQuery, setSelectedArticle };
});
