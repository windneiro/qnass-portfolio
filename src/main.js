import './style.css';
import { PaperBackground } from './three/paperBackground.js';
import { IntroBoxScene } from './three/introBoxScene.js';
import { CyberCursor } from './ui/cursor.js';
import { OrderModal } from './ui/modal.js';
import { ScrollEngine } from './ui/scrollEngine.js';
import { cyberAudio } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Дизайнерский курсор и модальное окно обратной связи
  new CyberCursor();
  new OrderModal();

  // 2. Фон: Чёрный со свечением красного цвета и прозрачная сетка, деформирующаяся по курсору
  const paperCanvas = document.getElementById('paper-canvas');
  if (paperCanvas) {
    new PaperBackground(paperCanvas);
  }

  // 3. Интерактивные карточки 4 принципов
  const ruleCards = document.querySelectorAll('.rule-quadrant-card');
  ruleCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      cyberAudio.playHover();
      ruleCards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  // 4. Кинематографический интро: Черный сплошной фон и 3D-коробка, распаковывающая сайт
  const introCanvas = document.getElementById('intro-box-canvas');
  if (introCanvas) {
    new IntroBoxScene({
      onComplete: () => {
        // Сайт распакован
      }
    });
  }



  // 5. Скролл-движок: навигация и секции
  new ScrollEngine({
    onSectionChange: (sectionId) => {
      cyberAudio.playHover();
    }
  });

  // Тактильные звуки при наведении на интерактивные элементы
  document.querySelectorAll('a, button, .interactive-card, .spilled-item-tag').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cyberAudio.playHover();
    });
  });
});
