import { CUSTOM_EVENTS, EVENT_BUS } from './common/event-bus';
import { portfolioProjects, PortfolioProject, ProjectSection, SubProject, MediaItem, ProcessStep } from './portfolioData';


const getElem = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const modalOverlay = getElem<HTMLDivElement>('portfolio-modal');
const viewGallery = getElem<HTMLDivElement>('view-gallery');
const viewDetail = getElem<HTMLDivElement>('view-detail');
const galleryContainer = getElem<HTMLDivElement>('project-gallery');
const scrollContainer = document.querySelector('.modal-container') as HTMLElement;

let currentCategory: PortfolioProject | null = null;




export function initPortfolioUI(eventEmitter: Phaser.Events.EventEmitter) {

    const closeBtn = getElem<HTMLButtonElement>('modal-close-btn');
    const backControl = getElem<HTMLDivElement>('modal-back-btn');

    closeBtn?.addEventListener('click', closeModal);
    backControl?.addEventListener('click', () => {
        if (currentCategory) {
            showCategoryGallery(currentCategory.id);
        }
    });

   
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

}


export function openModal(categoryId: string) {
    if (!modalOverlay) return;

    modalOverlay.classList.remove('hidden');
    void modalOverlay.offsetWidth;
    modalOverlay.classList.add('active');

    showCategoryGallery(categoryId);
}

export function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');

    EVENT_BUS.emit(CUSTOM_EVENTS.PORTFOLIO_CLOSED);
    
    // 延迟隐藏，等待 CSS 过渡动画完成
    setTimeout(() => {
        if (!modalOverlay.classList.contains('active')) {
            modalOverlay.classList.add('hidden');
        }
    }, 600);
}


function getEmbedUrl(url: string): string {
    if (url.includes('youtube.com/watch?v=')) {
        return url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
        const id = url.split('/').pop();
        return `https://www.youtube.com/embed/${id}`;
    }
    return url;
}


function initDragScroll() {
    const tracks = document.querySelectorAll('.carousel-track');
    tracks.forEach(trackElement => {
        const track = trackElement as HTMLElement;
        let isDown = false, startX: number, scrollLeft: number;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
            track.style.scrollSnapType = 'none';
        });

        track.addEventListener('mouseleave', () => { 
            isDown = false; 
            track.style.scrollSnapType = 'x mandatory'; 
        });

        track.addEventListener('mouseup', () => { 
            isDown = false; 
            track.style.scrollSnapType = 'x mandatory'; 
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5;
            track.scrollLeft = scrollLeft - walk;
        });
    });
}

/**
 * 生成章节标签
 */
function getSectionLabel(sec: ProjectSection, index: number): string {
    // 优先返回自定义标签
    if (sec.label) return sec.label;
    
    // 否则按默认逻辑返回
    if (sec.type === 'carousel') return 'GALLERY';
    if (sec.type === 'video') return 'VIDEO';
    const rowLabels = ['CONCEPT', 'REFERENCE', 'PROCESS', 'OUTCOME'];
    return rowLabels[index] || 'DETAIL';
}



function showCategoryGallery(categoryId: string) {
    const project = portfolioProjects.find(p => p.id === categoryId);
    console.log("categoryId raw:", JSON.stringify(categoryId));
console.log("all ids:", portfolioProjects.map(p => JSON.stringify(p.id)));
    if (!project) return;

    currentCategory = project; // 记忆当前分类
    const backControl = getElem<HTMLDivElement>('modal-back-btn');
    
    // 隐藏详情页，显示画廊页
    viewDetail.classList.add('hidden');
    viewGallery.classList.remove('hidden');
    backControl?.classList.add('hidden'); // 分类页不需要返回按钮（有关闭按钮）

    // 设置分类标题 (对应你截图中的 LEVEL DESIGN)
    const galleryTitle = getElem<HTMLElement>('gallery-title'); // 假设 HTML 中有这个 ID
    if (galleryTitle) galleryTitle.innerText = project.title;

    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';

    // 🚩 核心逻辑：遍历该分类下的所有子项目，生成卡片
    project.projects.forEach((subProject, index) => {
        const card = document.createElement('div');
        card.classList.add('project-card');

        const imageHtml = subProject.thumbnail 
            ? `<img src="${subProject.thumbnail}" alt="${subProject.title}" class="project-card-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="project-image-placeholder" style="display:none;">🖼️</div>`
            : `<div class="project-image-placeholder">🖼️</div>`;
        
        // 🚩 修复：将 imageHtml 变量放入模板中，而不是留空
        card.innerHTML = `
            <div class="project-img-wrapper">
                ${imageHtml}
            </div>
            <div class="project-info-overlay">
                <span class="project-title">${subProject.title}</span>
            </div>
        `;

        // 点击卡片进入详情
        card.onclick = (e) => {
            e.stopPropagation();
            showSubProjectDetail(subProject);
        };
        galleryContainer.appendChild(card);
    });
}


/**
 * 展示具体某个项目的图文详情
 */
function showSubProjectDetail(subProject: SubProject) {
    const backControl = getElem<HTMLDivElement>('modal-back-btn');
    
    // 切换视图动画
    viewGallery.classList.add('hidden-left');
    
    setTimeout(() => {
        viewGallery.classList.add('hidden');
        viewGallery.classList.remove('hidden-left');
        
        renderSubProjectHTML(subProject);
        
        viewDetail.classList.remove('hidden');
        backControl?.classList.remove('hidden'); // 显示返回按钮
        
        if (scrollContainer) scrollContainer.scrollTop = 0;
        initDragScroll();
    }, 200);
}

function renderMediaItem(item: MediaItem): string {
    if (item.type === 'video') {
        const embedUrl = getEmbedUrl(item.url);
        return `
            <div class="carousel-item is-video">
                <iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
            </div>
        `;
    } else {
        return `
            <div class="carousel-item">
                <img src="${item.url}" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.innerHTML='🖼️'">
            </div>
        `;
    }
}


function renderProcessSteps(steps: ProcessStep[]): string {
    return steps.map((step, i) => {
        // 处理多张图片：遍历 images 数组并生成 HTML
        const imagesHtml = (step.img && step.img.length > 0) 
            ? step.img.map(imgUrl => `
                <div class="step-media">
                    <img src="${imgUrl}" alt="${step.title}" onerror="this.style.display='none'">
                </div>
            `).join('')
            : '';

        return `
            <div class="process-step">
                <div class="step-sidebar">
                    <div class="step-number">0${i + 1}</div>
                    ${i < steps.length - 1 ? '<div class="step-line"></div>' : ''}
                </div>
                <div class="step-body">
                    <h4 class="step-title">${step.title}</h4>
                    <div class="step-content">
                        <div class="step-text"><p>${step.text}</p></div>
                        <div class="step-media-container">
                            ${imagesHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}



function renderSubProjectHTML(subProject: SubProject) {
    if (!viewDetail) return;

    let html = `
        <div class="detail-page">
            <section class="detail-hero">
                <h2 class="detail-title">${subProject.title}</h2>
                <p class="detail-intro">${subProject.intro}</p>
            </section>
            <div class="detail-sections">
    `;

    subProject.sections.forEach((sec, index) => {
        const label = getSectionLabel(sec, index);
        if (sec.type === 'row') {
            html += `
                <section class="detail-panel">
                    <div class="panel-label">${label}</div>
                    <div class="panel-row ${sec.reverse ? 'is-reverse' : ''}">
                        <div class="panel-copy"><p>${sec.text}</p></div>
                        <div class="panel-media"><div class="panel-image">
                         ${sec.img ? `<img src="${sec.img}" alt="${label}" style="width:100%; height:100%; object-fit:cover;">` : ''}</div></div>
                    </div>
                </section>
            `;
        } else if (sec.type === 'carousel') {
           const isMinimal = sec.layout === 'minimal';
            const itemsHtml = sec.items.map(item => `<div class="carousel-item-wrap">${renderMediaItem(item)}</div>`).join('');
            
            if (isMinimal) {
                html += `
                    <section class="detail-panel is-minimal">
                        <div class="panel-carousel">
                            <div class="carousel-track">${itemsHtml}</div>
                        </div>
                        <div class="panel-carousel-copy"><p>${sec.text}</p></div>
                    </section>
                `;
            } else {
                html += `
                    <section class="detail-panel">
                        <div class="panel-label">${label}</div>
                        <div class="panel-carousel-copy"><p>${sec.text}</p></div>
                        <div class="panel-carousel">
                            <div class="carousel-track">${itemsHtml}</div>
                        </div>
                    </section>
                `;
            }
        } else if (sec.type === 'video') {
            const isMinimal = sec.layout === 'minimal';
            const embedUrl = getEmbedUrl(sec.videoUrl);
            const label = getSectionLabel(sec, index);
            if (isMinimal) {
                html += `<section class="detail-panel is-minimal"><div class="video-container"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div><div class="panel-carousel-copy"><p>${sec.text}</p></div></section>`;
            } else {
                html += `<section class="detail-panel"><div class="panel-label">${label}</div><div class="panel-carousel-copy"><p>${sec.text}</p></div><div class="video-container"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div></section>`;
            }
        
        } 
        else if (sec.type === 'process') {
            html += `
                <section class="detail-panel">
                    <div class="panel-label">${label}</div>
                    <div class="process-container">
                        ${renderProcessSteps(sec.steps)}
                    </div>
                </section>
            `;
        }
        else if (sec.type === 'link') {
            html += `
                <section class="detail-panel">
                    <div class="panel-label">${label}</div>
                    <div class="download-container">
                        <p class="download-text">${sec.text}</p>
                        <a href="${sec.url}" target="_blank" class="pixel-button">
                            <span>${sec.buttonText}</span>
                        </a>
                    </div>
                </section>
            `;
        }
    });

    html += `
            </div>
            <button class="scroll-to-top" id="top-btn" aria-label="Back to top">↑</button>
        </div>
    `;

    viewDetail.innerHTML = html;

    const topBtn = document.getElementById('top-btn');
    if (topBtn) {
        topBtn.onclick = () => {
            if (scrollContainer) {
                scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
    }
}
