import "../UX/Cards.css";

const Cards = () => {
    return (
        <div className="cards">
            <div className="card">
                <p>Индивидуальный режим</p>
                <img src="src/assets/personal.png" alt="Индивидуальный режим" />
            </div>
            <div className="card">
                <p>Командный режим</p>
                <img src="src/assets/team.png" alt="Командный режим" />
            </div>
            <div className="card">
                <p>Корпоративный режим</p>
                <img src="src/assets/company.png" alt="Корпоративный режим" />
            </div>
        </div>
    );
};

export default Cards;