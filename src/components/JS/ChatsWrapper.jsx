import "../UX/ChatsWrapper.css";
import Cards from "./Cards";
import Chat from "./Chat";


const ChatsWrapper = () => {
    return (
        <div className="chat-wrapper-container">
            <p>ЛЮДИ, ДАННЫЕ И ТЕХНОЛОГИИ — ЕДИНОЕ ЦЕЛОЕ</p>
            <Chat placeholder={"Задайте любой вопрос о сервисе..."}/>
            <Cards />
        </div>
    );
};

export default ChatsWrapper;