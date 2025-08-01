import { useCallback, useEffect, useState, useRef } from "react";
import { sendMessage } from "../ws";
import { removeCardFromDeck } from "../utils/deckUtils";

const cardWidth = 64;
const cardHeight = 89;

export function useCardDrag({
  canvasRef,
  stageScale,
  stagePosition,
  draggingCard,
  dragSource,
  setDragSource,
  setDraggingCard,
  setDragPos,
  setCards,
  setHand,
  setHandSizes,
  username,
  ignoreNextChange,
  cards,
  decks,
  setDecks,
  contextMenuDeckId,
  isRotated,
  cardDraggedToDeckMenu,
  setPeekCardsData,
  spectator,
  selectionRect,
  setSelectionRect,
  selectedCards,
  setSelectedCards,
  selectedCardsOffsets,
  setSelectedCardsOffsets,
}) {
  const onMouseMove = useCallback((e) => {
    // Intentionally empty — mousemove handled globally on window
  });
  const onMouseUp = useCallback((e) => {
    // Intentionally empty — mouseup handled globally on window
  }, []);
  const [hasMoved, setHasMoved] = useState(false);
  const pendingDragRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  function getCardMouseDownHandler(card, source, rotation) {
    if (spectator) return {};
    return (e) => {
      const isLeftClick = ("evt" in e && e.evt.button === 0) || e.button === 0;
      if (!isLeftClick) return;
      setHasMoved(false);
      pendingDragRef.current = {
        card: {
          ...card,
          flipIndex: card.flipIndex ?? 0, // ensure it's defined
        },
        source,
        rotation,
      };
      if ("evt" in e) {
        e.evt.preventDefault();
        e.evt.stopPropagation();
      } else {
        e.preventDefault();
        e.stopPropagation();
      }
    };
  }
  useEffect(() => {
    function handleGlobalMouseMove(e) {
      const rect = canvasRef.current?.getBoundingClientRect();
      let x = (e.clientX - rect.left - stagePosition.x) / stageScale;
      let y = (e.clientY - rect.top - stagePosition.y) / stageScale;
      if (selectionRect) {
        const newX = Math.min(x);
        const newY = Math.min(y);
        const newWidth = Math.abs(x - selectionRect.startX);
        const newHeight = Math.abs(y - selectionRect.startY);
        setSelectionRect((prev) => ({
          ...prev,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        }));

        // select items
        const startX = selectionRect.startX;
        const startY = selectionRect.startY;
        const rectLeft = Math.min(startX, x);
        const rectRight = Math.max(startX, x);
        const rectTop = Math.min(startY, y);
        const rectBottom = Math.max(startY, y);
        const tmpSelectedCards = cards.filter((card) => {
          const cardLeft = isRotated ? -card.x - cardWidth : card.x;
          const cardRight = isRotated ? -card.x : card.x + cardWidth;
          const cardTop = isRotated ? -card.y - cardHeight : card.y;
          const cardBottom = isRotated ? -card.y : card.y + cardHeight;
          const horizontalOverlap =
            cardRight >= rectLeft && cardLeft <= rectRight;
          const verticalOverlap =
            cardBottom >= rectTop && cardTop <= rectBottom;
          return horizontalOverlap && verticalOverlap;
        });
        setSelectedCards(tmpSelectedCards);
      } else {
        x = x - cardWidth / 2;
        y = y - cardHeight / 2;
      }
      if (!hasMoved) {
        setHasMoved(true);
        if (pendingDragRef.current) {
          const selectedCardsOffsets = selectedCards.map((card) => ({
            x: isRotated
              ? -card.x + pendingDragRef.current.card.x
              : card.x - pendingDragRef.current.card.x,
            y: isRotated
              ? -card.y + pendingDragRef.current.card.y
              : card.y - pendingDragRef.current.card.y,
          }));
          setSelectedCardsOffsets(selectedCardsOffsets);
          let offsetX = 0;
          let offsetY = 0;
          const pendingCard = pendingDragRef.current?.card;
          if (pendingCard?.x != null) {
            offsetX = isRotated ? x + pendingCard.x + 64 : x - pendingCard.x;
          }
          if (pendingCard?.y != null) {
            offsetY = isRotated ? y + pendingCard.y + 89 : y - pendingCard.y;
          }
          dragOffsetRef.current = {
            x: offsetX,
            y: offsetY,
          };
          const { card, source, rotation } = pendingDragRef.current;
          pendingDragRef.current = null;
          card.rotation = rotation;
          setDraggingCard(card);
          setDragSource(source);
        }
      }
      if (!draggingCard) return;
      setDragPos({
        x: x - dragOffsetRef.current.x,
        y: y - dragOffsetRef.current.y,
      });
    }
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [
    draggingCard,
    canvasRef,
    stagePosition,
    stageScale,
    setDragPos,
    setDraggingCard,
    setDragSource,
    hasMoved,
    selectionRect,
  ]);

  const onMouseDown = useCallback(
    (e) => {
      if (e.evt.button !== 1) {
        if (e.evt.button === 0) {
          if (pendingDragRef.current == null) {
            setSelectedCards([]);
            setSelectedCardsOffsets([]);
          }
        }
        // Disable dragging for anything other than middle mouse
        e.target.getStage().draggable(false);
        const isDiceRoller = !!e.target.findAncestor(".DiceRoller", true);
        const isCounter = !!e.target.findAncestor(".Counter", true);
        if (pendingDragRef.current == null && !isDiceRoller && !isCounter) {
          const { x, y } = e.target.getStage().getPointerPosition();

          const rect = canvasRef.current?.getBoundingClientRect();
          const testx =
            (e.evt.clientX - rect.left - stagePosition.x) / stageScale;
          const testy =
            (e.evt.clientY - rect.top - stagePosition.y) / stageScale;
          setSelectionRect({
            x,
            y,
            width: 0,
            height: 0,
            startX: testx,
            startY: testy,
          });
        }
      } else {
        e.target.getStage().draggable(true);
      }
      e.evt.preventDefault();
      e.evt.stopPropagation();
    },
    [canvasRef, stagePosition, stageScale, cards]
  );

  useEffect(() => {
    function handleGlobalMouseUp(e) {
      if (spectator) return;
      setSelectionRect(null);
      const isLeftClick = ("evt" in e && e.evt.button === 0) || e.button === 0;

      if (!isLeftClick) return;
      pendingDragRef.current = null;
      if (!hasMoved) {
        return;
      }
      if (!draggingCard) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const elementUnderCursor = document.elementFromPoint(
        e.clientX,
        e.clientY
      );
      if (elementUnderCursor?.closest(".deck-card-viewer")) {
        setDraggingCard(null);
        return;
      }
      const dropY = e.clientY;
      const handThreshold = window.innerHeight - 80;
      const isDroppingInHand = dropY > handThreshold;
      var x =
        (e.clientX - rect.left - stagePosition.x) / stageScale - cardWidth / 2;
      var y =
        (e.clientY - rect.top - stagePosition.y) / stageScale - cardHeight / 2;
      x = x - dragOffsetRef.current.x;
      y = y - dragOffsetRef.current.y;
      if (isRotated) {
        x = -x - 64;
        y = -y - 89;
      }
      const card = draggingCard;

      const decksArray = Object.values(decks);
      const droppedOnDeck = decksArray.find((deck) => {
        const deckX = deck.x;
        const deckY = deck.y;
        const dropCenterX = x + cardWidth / 2;
        const dropCenterY = y + cardHeight / 2;

        return (
          dropCenterX >= deckX &&
          dropCenterX <= deckX + cardWidth &&
          dropCenterY >= deckY &&
          dropCenterY <= deckY + cardHeight
        );
      });

      if (droppedOnDeck) {
        cardDraggedToDeckMenu(card, droppedOnDeck.id, {
          x: e.clientX,
          y: e.clientY,
        });
        setDraggingCard(null);
        return;
      }

      if (dragSource === "board") {
        if (isDroppingInHand) {
          if (selectedCards.length == 0) {
            const untappedCard = { ...card, x, y, tapped: false, flipIndex: 0 };
            setHand((prev) => [...prev, untappedCard]);
            setCards((prev) => prev.filter((c) => c.id !== card.id));
            setHandSizes((prev) => ({
              ...prev,
              [username]: prev[username] + 1,
            }));
            sendMessage({ type: "RETURN_TO_HAND", id: card.id, username });
          } else {
            const untappedCards = selectedCards.map((c) => ({
              ...c,
              x,
              y,
              tapped: false,
              flipIndex: 0,
            }));
            setHand((prev) => [...prev, ...untappedCards]);
            setCards((prev) =>
              prev.filter((c) => !selectedCards.some((sc) => sc.id === c.id))
            );
            setHandSizes((prev) => ({
              ...prev,
              [username]: prev[username] + selectedCards.length,
            }));
            sendMessage({
              type: "RETURN_CARDS_TO_HAND",
              cards: selectedCards.map((c) => ({ id: c.id })),
              username,
            });

            setSelectedCards([]);
          }
        } else {
          //dragging within the board
          if (selectedCards.length == 0) {
            setCards((prev) =>
              prev.map((c) =>
                c.id === card.id ? { ...c, x, y, flipIndex: card.flipIndex } : c
              )
            );
            sendMessage({
              type: "MOVE_CARD",
              id: card.id,
              x,
              y,
              flipIndex: card.flipIndex,
            });
          } else {
            setCards((prev) =>
              prev.map((c) => {
                const index = selectedCards.findIndex((sc) => sc.id === c.id);
                if (index !== -1) {
                  const offset = selectedCardsOffsets[index];
                  return {
                    ...c,
                    x: isRotated ? x - offset.x : x + offset.x,
                    y: isRotated ? y - offset.y : y + offset.y,
                    flipIndex: selectedCards[index].flipIndex,
                  };
                }
                return c;
              })
            );
            const movedCards = selectedCards.map((card, index) => {
              const offset = selectedCardsOffsets[index];
              return {
                ...card,
                x: isRotated ? x - offset.x : x + offset.x,
                y: isRotated ? y - offset.y : y + offset.y,
              };
            });
            sendMessage({
              type: "MOVE_CARDS",
              cards: movedCards,
            });
          }
        }
      } else if (dragSource === "deckCardViewer") {
        if (isDroppingInHand) {
          setHand((prev) => [...prev, card]);
          setCards((prev) => prev.filter((c) => c.id !== card.id));
          setHandSizes((prev) => ({
            ...prev,
            [username]: prev[username] + 1,
          }));
          sendMessage({
            type: "TUTOR_TO_HAND",
            id: card.id,
            username: contextMenuDeckId,
          });
        } else {
          const playedCard = {
            id: card.id,
            name: card.name,
            imageUrl: card.imageUrl,
            imageUrlBack: card.imageUrlBack,
            uid: card.uid,
            hasTokens: card.hasTokens,
            numFaces: card.numFaces,
            x,
            y,
            tapped: false,
            flipIndex: draggingCard.flipIndex,
            owner: username,
            token: card.token,
          };

          setCards((prev) => [...prev, playedCard]);
          sendMessage({
            type: "CARD_PLAYED_FROM_LIBRARY",
            card: playedCard,
            username: contextMenuDeckId,
          });
        }
        setPeekCardsData((prev) => {
          if (!prev) return { cards: [], position: "" };
          const updatedCards = prev.cards.filter((c) => c.id !== card.id);
          return updatedCards.length > 0
            ? { ...prev, cards: updatedCards }
            : { cards: [], position: "" };
        });
        setDecks((prevDecks) =>
          removeCardFromDeck(prevDecks, contextMenuDeckId, card.id)
        );
      } else if (dragSource === "hand") {
        if (isDroppingInHand) {
          ignoreNextChange.current = true;
        } else {
          card.owner = username;
          setCards((prev) => [...prev, { ...card, x, y }]);
          setHand((prev) => prev.filter((c) => c.id !== card.id));
          setHandSizes((prev) => ({
            ...prev,
            [username]: prev[username] - 1,
          }));
          sendMessage({
            type: "CARD_PLAYED_FROM_HAND",
            card: {
              id: card.id,
              name: card.name,
              imageUrl: card.imageUrl,
              imageUrlBack: card.imageUrlBack,
              uid: card.uid,
              hasTokens: card.hasTokens,
              numFaces: card.numFaces,
              x,
              y,
              tapped: false,
              flipIndex: draggingCard.flipIndex,
              token: card.token,
            },
            username,
          });
        }
      }
      setDraggingCard(null);
      setDragSource(null);
    }

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [
    draggingCard,
    dragSource,
    canvasRef,
    stagePosition,
    stageScale,
    setCards,
    setHand,
    username,
    ignoreNextChange,
    selectionRect,
  ]);
  const stageDraggable = !draggingCard && !pendingDragRef.current;
  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    getCardMouseDownHandler,
    hasMoved,
    stageDraggable,
  };
}
