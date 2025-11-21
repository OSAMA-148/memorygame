import { useEffect, useState } from "react";

export const useGameLogic = (cardValues) => {
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const initializeGame = () => {
        // SHUFFLE THE CARDS
        const shuffled = shuffleArray(cardValues);

        const finalCards = shuffled.map((value, index) => ({
            id: index,
            value,
            isFlipped: false,
            isMatched: false,
        }));

        setCards(finalCards);
        setIsLocked(false);
        setMoves(0);
        setScore(0);
        setMatchedCards([]);
        setFlippedCards([]);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        initializeGame();
    }, [cardValues]);

    const handleCardClick = (card) => {
        // Don't allow clicking if card is already flipped, matched or locked
        if (
            card.isFlipped ||
            card.isMatched ||
            isLocked ||
            flippedCards.length === 2
        ) {
            return;
        }

        // Update card flipped state
        const newCards = cards.map((c) =>
            c.id === card.id ? { ...c, isFlipped: true } : c
        );
        setCards(newCards);

        const newFlippedCards = [...flippedCards, card.id];
        setFlippedCards(newFlippedCards);

        // If two cards are flipped now, check for match
        if (newFlippedCards.length === 2) {
            setIsLocked(true);

            const firstCard = newCards.find((c) => c.id === newFlippedCards[0]);
            const secondCard = newCards.find(
                (c) => c.id === newFlippedCards[1]
            );

            if (!firstCard || !secondCard) {
                // safety: unlock and reset
                setIsLocked(false);
                setFlippedCards([]);
                return;
            }

            if (firstCard.value === secondCard.value) {
                setTimeout(() => {
                    setMatchedCards((prev) => [
                        ...prev,
                        firstCard.id,
                        secondCard.id,
                    ]);
                    setScore((prev) => prev + 1);
                    setCards((prev) =>
                        prev.map((c) =>
                            c.id === firstCard.id || c.id === secondCard.id
                                ? { ...c, isMatched: true }
                                : c
                        )
                    );
                    setFlippedCards([]);
                    setIsLocked(false);
                }, 500);
            } else {
                setTimeout(() => {
                    setCards((prev) =>
                        prev.map((c) =>
                            newFlippedCards.includes(c.id)
                                ? { ...c, isFlipped: false }
                                : c
                        )
                    );
                    setFlippedCards([]);
                    setIsLocked(false);
                }, 1000);
            }

            setMoves((prev) => prev + 1);
        }
    };

    const isGameComplete =
        cards.length > 0 && matchedCards.length === cards.length;

    return {
        cards,
        score,
        moves,
        isGameComplete,
        initializeGame,
        handleCardClick,
    };
};
