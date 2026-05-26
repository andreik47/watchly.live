const callToViewData = [
  {
    id: "call-1",
    title: "When I Fly Towards You",
    description: "A touching romantic story about friendship, dreams and growing up. “When I Fly Towards You” follows a group of teenagers discovering love, courage and unforgettable moments together.",
    logo: "../img/hero-calltoview/1/logo.svg",
    background: "../img/hero-calltoview/1/background.webp",
    thumbnail: "../img/hero-calltoview/tumbs-1.svg"
  },
  {
    id: "call-2",
    title: "Family Ties",
    description: "Experience the complex dynamics of a modern family as they navigate through challenges, laughter, and the unbreakable bonds that keep them together in a changing world.",
    logo: "../img/hero-calltoview/2/logo.svg",
    background: "../img/hero-calltoview/2/background.webp",
    thumbnail: "../img/hero-calltoview/tumbs-2.svg"
  },
  {
    id: "call-3",
    title: "The Silent Forest",
    description: "A mysterious journey into the heart of an ancient forest where secrets are buried deep. A young explorer discovers that nature has its own way of protecting its past.",
    logo: "../img/hero-calltoview/3/logo.svg",
    background: "../img/hero-calltoview/3/background.webp",
    thumbnail: "../img/hero-calltoview/tumbs-3.svg"
  },
  {
    id: "call-4",
    title: "Urban Legends",
    description: "In the heart of the city, some stories are more than just myths. Discover the hidden world that lives in the shadows of the skyscrapers and neon lights.",
    logo: "../img/hero-calltoview/4/logo.svg",
    background: "../img/hero-calltoview/4/background.webp",
    thumbnail: "../img/hero-calltoview/tumbs-4.svg"
  }
];

let currentCallIndex = 0;

const callSection = document.querySelector('.calltoview-section');
const callLogo = document.querySelector('.image-11-icon');
const callDescription = document.querySelector('.during-a-plagues');
const callThumbnailsContainer = document.getElementById('callThumbnailsContainer');
const callPrevBtn = document.querySelector('.calltoview-prev-btn');
const callNextBtn = document.querySelector('.calltoview-next-btn');

function updateCallToViewUI() {
  const data = callToViewData[currentCallIndex];

  callSection.style.backgroundImage = `url('${data.background}')`;
  
  callLogo.src = data.logo;
  callLogo.alt = data.title;
  callDescription.textContent = data.description;

  renderCallThumbnails();
}

function renderCallThumbnails() {
  if (!callThumbnailsContainer) return;
  
  callThumbnailsContainer.innerHTML = "";

  callToViewData.forEach((item, index) => {
    let thumb;
    
    if (index === currentCallIndex) {
      const activeDiv = document.createElement("div");
      activeDiv.className = "active-thumb";
      activeDiv.style.backgroundImage = `url('${item.thumbnail}')`;

      const arrowIndicator = document.createElement("img");
      arrowIndicator.src = "../img/hero-calltoview/active-arrow.svg";
      arrowIndicator.alt = "Active";
      
      activeDiv.appendChild(arrowIndicator);
      activeDiv.addEventListener("click", () => {
        currentCallIndex = index;
        updateCallToViewUI();
      });
      thumb = activeDiv;
    } else {
      const thumbImg = document.createElement("img");
      thumbImg.src = item.thumbnail;
      thumbImg.alt = `Thumbnail ${index + 1}`;
      thumbImg.addEventListener("click", () => {
        currentCallIndex = index;
        updateCallToViewUI();
      });
      thumb = thumbImg;
    }

    callThumbnailsContainer.appendChild(thumb);
  });
}

if (callNextBtn) {
    callNextBtn.addEventListener('click', () => {
      currentCallIndex = (currentCallIndex + 1) % callToViewData.length;
      updateCallToViewUI();
    });
}

if (callPrevBtn) {
    callPrevBtn.addEventListener('click', () => {
      currentCallIndex = (currentCallIndex - 1 + callToViewData.length) % callToViewData.length;
      updateCallToViewUI();
    });
}

document.addEventListener('DOMContentLoaded', () => {
  if (callSection) {
    updateCallToViewUI();
  }
});
