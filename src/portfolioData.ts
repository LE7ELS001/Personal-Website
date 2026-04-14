
export type MediaItem = 
    | { type: 'image'; url: string }
    | { type: 'video'; url: string };


    
export type ProcessStep = {
    title: string;
    text: string;
    img?: string[];
}

export type ProjectSection =
    | { type: 'row'; text: string; img: string; reverse: boolean; label?: string }
    | { 
        type: 'carousel'; 
        text: string; 
        items: MediaItem[]; 
        layout?: 'default' | 'minimal'; 
        label?: string;
      }
    | { type: 'video'; text: string; videoUrl: string; layout?: 'default' | 'minimal', label?: string; }
    | { 
        type: 'process'; 
        label?: string; 
        steps: ProcessStep[] 
    }
      | { 
        type: 'link'; 
        label?: string; 
        text: string; 
        buttonText: string; 
        url: string; 
      };


/**
 * 定义单个具体项目的结构
 * 包含自己的标题、简介和展示章节
 */
export interface SubProject {
    title: string;
    intro: string;
    thumbnail?: string;
    sections: ProjectSection[];
}

/**
 * 定义作品集项目的接口
 */
export interface PortfolioProject {
    id: string;
    title: string;
    label: string;
    intro: string;
    heroImage?: string;
    category?: 'game' | 'levelDesign' | '3D'| 'article'; 
    projects: SubProject[];
}


export const portfolioProjects: PortfolioProject[] = [
    {
        id: "levelDesign",
        title: "Level Design",
        label: "LEVEL DESIGN", 
        intro: "here's a collection of my level design work",
        projects: [
            {
                title: "Half-Life 2 mod: Escape-01",
                intro: "",
                thumbnail: "assets/images/portfolioContent/LevelDesign/escape-01/project-card2.png",
                sections: [
                    { 
                        type: "carousel", 
                        text: "Escape-01 is a single-player level built as a Half-Life 2 mod, focused on exploration and combat. It features multiple paths to completion, allowing players to approach encounters in different ways and explore the space at their own pace.", 
                        items: [
                            { type: 'video', url: 'https://youtu.be/jay7yWz8UWM' }, 
                            { type: 'image', url: 'assets/images/portfolioContent/LevelDesign/escape-01/project-overview2.png' }, 
                            { type: 'image', url: 'assets/images/portfolioContent/LevelDesign/escape-01/project-overview3.png' },
                            { type: 'image', url: 'assets/images/portfolioContent/LevelDesign/escape-01/project-overview1.png' }  
                        ],
                        layout: 'minimal' ,
                    },

                    
                    {
                        type: "carousel", label: "DESIGN GOAL", text: "Create a 5-8 minutes Half-Life 2 level with theme 'escape'. Use the game's built-in physics system to design puzzles and its existing enemies to create combat scenarios. Design multiple routes to complete the level.", items: [
                         
                        ], layout: 'default'
                    },
                     

                    {
                        type: "process",
                        label: "DESIGN PROCESS",
                        steps: [
                            {
                                title: "List Available Elements",
                                text: "After defining the design goal, I first identify relevant elements to understand what resources and assets are available.\n\nSince the level focuses on multiple routes, this step explores how each path can be differentiated. Variations are introduced through rewards and difficulty. For example, different routes may offer different rewards, not only in quantity but also by granting access to new items earlier. Routes are also designed to vary in difficulty, influenced by factors such as enemy count, enemy types, and combat intensity.",
                                img: ["assets/images/portfolioContent/LevelDesign/escape-01/element-list.png"]
                            },
                            {
                                title: "Sequences",
                                text: "At this stage, I map out the player's moment-to-moment experience throughout the level. The sequence defines how players progress, where key decisions happen, and how pacing shifts between exploration and combat.\n\nThe sequence is designed around the theme of escape, as well as the intended balance between combat and exploration, and the presence of multiple routes. Early stages focus on teaching the player core interactions and combat. As the level progresses, hidden elements within the environment are gradually introduced, encouraging players to actively explore and discover alternative ways to progress.",
                                img: ["assets/images/portfolioContent/LevelDesign/escape-01/sequence.png"]
                            },
                            {
                                title: "Layout Sketches",
                                text: "At this stage, I translate the sequence into rough layout sketches on paper, defining the overall structure of the level, including spatial layout and enemy placement.\n\nFor this project, the sketches are used to evaluate how well the multiple routes function within the space. This includes checking whether hidden paths feel appropriately placed and not too distant from the main flow. The layout is also used to position hidden supplies in a way that attracts player attention through spatial arrangement. Additionally, I consider how different routes converge back toward the same final destination, ensuring a coherent progression regardless of player choice. Enemy placement is planned alongside the layout, including the positioning of cover to support combat encounters.",
                                img: [".assets/images/portfolioContent/LevelDesign/escape-01/sketches.jpg"]
                            },
                            {
                                title: "Implementation and Iteration",
                                text: "At this stage, the level is implemented in-engine based on the layout sketches, with continuous iteration throughout the process.\n\nDuring implementation, the spatial scale is tested and adjusted, as layouts that appear reasonable in sketches may feel too large or too small in practice.\n\nEnemy behavior is also evaluated to ensure it aligns with the intended design. When certain behaviors become too complex to implement, alternative solutions are considered to achieve a similar gameplay effect.\n\nThe feasibility of designed mechanics is tested as well. For example, interactions such as triggering doors with switches are implemented when possible, or replaced with alternative solutions if needed.\n\nFinally, the intended player experience defined in the sequence is validated in practice, ensuring that pacing, progression, and interactions function as expected.\n\n In terms of iteration, adjustments are not only made based on in-engine results but are also guided by ongoing reflection throughout the process. During development, questions related to the sequence are continuously raised and explored, helping to evaluate whether the intended player experience is being achieved. Ideas that emerge during implementation are also noted and documented and may later be incorporated into subsequent iterations when relevant. ",
                                img: ["assets/images/portfolioContent/LevelDesign/escape-01/editor.png", "assets/images/portfolioContent/LevelDesign/escape-01/question.png", "assets/images/portfolioContent/LevelDesign/escape-01/idea.png"]
                            },
                            
                        ]
                    },

                    {
                        type: "process",
                        label: "Design Principles Applied",
                        steps: [
                            {
                                title: "Guiding Through Lighting",
                                text: "Lighting is used as a guiding tool to direct the player’s attention throughout the level. It highlights hidden areas, guides where the player should look, and subtly suggests the direction of progression. In several moments, brighter or more focused lighting is used to draw attention to points of interest, encouraging exploration without relying on explicit instructions.",
                                img: ["assets/images/portfolioContent/LevelDesign/escape-01/light1.png","assets/images/portfolioContent/LevelDesign/escape-01/light2.png","assets/images/portfolioContent/LevelDesign/escape-01/light3.png","assets/images/portfolioContent/LevelDesign/escape-01/light4.png"]
                            },
                            {
                                title: "Misdirection",
                                text: "Misdirection is also used to guide the player’s attention toward one point of interest while subtly revealing another. For example, armor pickups are used to draw attention toward hidden ventilation paths, while supply crates encourage players to climb over fences, leading them to discover hidden hatches from a higher vantage point. This creates a layered discovery process driven by player interaction.",
                                img: ["assets/images/portfolioContent/LevelDesign/escape-01/misdirection2.png", "assets/images/portfolioContent/LevelDesign/escape-01/misdirection3.png"]
                            },
                            {
                                title: "Environmental Storytelling",
                                text: "Environmental storytelling is used to communicate information about the space and foreshadow danger. Elements such as corpses and warning marks suggest that previous encounters have occurred, indicating that the area ahead may be unsafe.Items found near these corpses also hint at what tools or strategies may be useful for the upcoming challenge. This prepares the player for combat while encouraging more cautious behavior, without the need for explicit guidance.",
                                img: ["assets/images/portfolioContent/LevelDesign/escape-01/EST.png"]
                            },
                            
                        ]
                    },


                    {
                        type: "carousel", label: "REFLECTION", text: "Through this project, I realized that building a playable level takes significantly more time than initially expected. This is partly due to technical challenges during implementation, such as incorrect scale, lighting issues, and unexpected enemy behavior. However, a more important factor was the tendency to continuously introduce new ideas during development. To address this, I learned the importance of defining a clear plan based on the design goal and sticking to it as much as possible, even when new ideas emerge.\n\nAnother challenge was difficulty balancing. Feedback from playtesting indicated that the level was too difficult. Upon reflection, I found that the main issue was the lack of a structured approach to difficulty design. If I were to improve this, I would assign a value to each enemy based on difficulty, and use the total value within a given area as a reference point. While this may not guarantee a perfectly balanced experience, it would help avoid drastic difficulty spikes.", items: [
                         
                        ], layout: 'default'
                    },
                ]
            },
            {
                title: "A Dungeon-01",
                intro: "",
                thumbnail: "assets/images/portfolioContent/LevelDesign/pixelDungeon01/projectCard.png",
                sections: [
                    { 
                        type: "carousel", 
                        text: "A Dungeon-01 is a top-down action-adventure level focused on exploration and combat. The level is built around hidden treasure chests that are revealed through player exploration and interaction with the environment.", 
                        items: [ 
                            { type: 'image', url: 'assets/images/portfolioContent/LevelDesign/pixelDungeon01/projectOverview1.png' }, 
                            { type: 'image', url: 'assets/images/portfolioContent/LevelDesign/pixelDungeon01/projectOverview2.png' },
                            { type: 'image', url: 'assets/images/portfolioContent/LevelDesign/pixelDungeon01/projectOverview3.png' },
                            { type: 'image', url: 'assets/images/portfolioContent/LevelDesign/pixelDungeon01/projectOverview4.png' },
                            
                        ],
                        layout: 'minimal' ,
                    },
                     {
                        type: "carousel", label: "DESIGN GOAL", text: "The goal of this level is to create a short (3–5 minute) dungeon experience inspired by classic Zelda-style gameplay. The level is designed to encourage exploration through systems such as character upgrades, hidden treasure chests, and combat encounters.", items: [
                         
                        ], layout: 'default'
                    },
                     
                     {
                        type: "process",
                        label: "DESIGN PROCESS",
                        steps: [
                            {
                                title: "Planning & Scope Definition",
                                text: "At this stage, I define the core elements of the level while also evaluating the available development time and scope. Since this project was built from scratch, there was flexibility to introduce new mechanics. However, due to time constraints, it was important to balance the deadline with feasibility\n\n I focused on a small set of core mechanics, such as combat, character upgrades, player interactions with objects, and revealing hidden chests, to support the design goal, while avoiding adding too many extra features that could impact completion.",
                                img: ["assets/images/portfolioContent/LevelDesign/pixelDungeon01/elements.png"]
                            },
                            {
                                title: "Sequences",
                                text: "At this stage, I define a sequence to guide the player’s learning and progression through the level. The focus is on gradually introducing core mechanics and helping the player understand how the game works.\n\nEarly on, the player learns how to interact with objects. The level then introduces the idea of hidden chests and encourage player to explore the area.\n\n As the level progresses, the player learns that objects can also be used against enemies, followed by combat encounters that teach the basics of fighting.\n\nEnemy placement is used to create a gradual difficulty curve, while also reflecting player progression through exploration.",
                                img: ["assets/images/portfolioContent/LevelDesign/pixelDungeon01/sequence.png"]
                            },
                            {
                                title: "Layout Sketches",
                                text:"At this stage, I translate the sequence into layout sketches to test whether the overall structure makes sense. I look at whether the player might be forced into unnecessary backtracking, and whether the layout feels clear and easy to navigate.\n\nI also evaluate whether exploration points are noticeable enough, so players can recognize unusual areas and investigate them.\n\nAt the same time, I evaluate the pace between exploration and combat, including how many enemies and hidden chests are placed throughout the level.",
                                img: ["assets/images/portfolioContent/LevelDesign/pixelDungeon01/sketches.jpeg"]
                            },
                            {
                                title: "Implementation and Iteration",
                                text: "At this stage, I implement and iterate on the level in Tiled based on the layout sketches. The focus is on testing whether the level actually supports the exploration-driven design goal.\n\nI adjust factors such as camera distance, level scale, and collision. Camera distance and level size affect whether players can notice points of interest as they move through the level.\n\nI also test collision to determine the minimum width a path needs in order for the player to move through it. This becomes a baseline reference for defining the overall scale and proportions of the level.",
                                img: ["assets/images/portfolioContent/LevelDesign/pixelDungeon01/implementation.png", "assets/images/portfolioContent/LevelDesign/pixelDungeon01/implementation.png"]
                            },
                            
                        ]
                    },
                     
                     {
                        type: "process",
                        label: "Design Principles Applied",
                        steps: [
                            {
                                title: "Onboarding through Level Design",
                                text:'Onboarding through level design is used to teach core mechanics without explicit instructions. The level introduces object interaction by requiring the player to pick up a pot in order to progress.\n\nThis is followed by a second instance that reinforces the interaction, allowing the player to practice the mechanic in a low-pressure context.\n\nFinally, the mechanic is applied in a meaningful way, where the player must use the pot to reveal a hidden mechanism and continue forward. This follows a “teach, practice, and apply” structure, helping the player understand the system through gameplay.',
                                img: ["assets/images/portfolioContent/LevelDesign/pixelDungeon01/Onboarding1.png", "assets/images/portfolioContent/LevelDesign/pixelDungeon01/Onboarding2.png", "assets/images/portfolioContent/LevelDesign/pixelDungeon01/Onboarding3.png"]
                            },
                            {
                                title: "Emergent Learning through Interaction",
                                text: 'Learning through interaction is used to introduce the offensive use of objects. By placing a pot as an obstacle, the player is required to pick it up to progress.\n\nAn enemy is then positioned directly in front of the player, naturally prompting them to throw the object.\n\nThis creates a situation where the player discovers that objects can be used as weapons through their own actions, reinforcing learning without explicit guidance.',
                                img: ["assets/images/portfolioContent/LevelDesign/pixelDungeon01/interact.png", "assets/images/portfolioContent/LevelDesign/pixelDungeon01/interact2.png"]
                            },
                            
                            
                        ]
                    },
                     
                     {
                        type: "carousel", label: "REFLECTION", text: "Through this project, I learned that exploration-driven level design cannot rely only on assumptions about how players will behave. It is important to test the level and observe how players actually interact with it.\n\nDuring playtesting with classmates, only 4 players engaged with the level in a way that matched the intended exploration-focused experience. Some players focused mainly on combat, while others did not even realize that hidden chests existed.\n\n This highlighted the importance of allocating time for playtesting within the overall design process, ensuring that player behavior can be observed and design decisions can be adjusted accordingly.", items: [
                         
                        ], layout: 'default'
                    },
                ]
            }
        ]
    },
    {
        id: "game",
        title: "Game Development",
        label: "GAME DEV", 
        intro: "Here's the collection of my Game development project",
        projects: [
            {
                title: "A Dungeon",
                intro: "",
                thumbnail: "assets/images/portfolioContent/Game/card.png",
                sections: [
                    { 
                        type: "carousel", 
                        text: 'A Dungeon is a top-down action-adventure game built with Phaser. It features exploration and combat mechanics, with a focus on hidden treasure chests that reward players with character upgrades.\n\nThe game includes systems for object interaction, combat, and progression, where players can uncover hidden content by exploring the environment or completing encounters. The project explores how core gameplay systems can support player-driven discovery and reward exploration.',
                        items: [ 
                            { type: 'image', url: 'assets/images/portfolioContent/Game/overview1.png' }, 
                            { type: 'image', url: 'assets/images/portfolioContent/Game/overview2.png' },
                            { type: 'image', url: 'assets/images/portfolioContent/Game/overview3.png' },
                            { type: 'image', url: 'assets/images/portfolioContent/Game/overview4.png' }  
                        ],
                        layout: 'minimal' ,
                    },

                      {
                        type: "carousel", label: "PROCESS", text:  "The development process began with implementing the core input system, allowing the player to control character movement and actions through keyboard input.\n\nA state machine was then introduced to manage different character states and animations, such as movement and attacking. This was supported by animation-related components to ensure smooth transitions and responsiveness.\n\nFollowing this, I implemented the player and enemy classes, defining their behaviors and interactions within the game.\n\nI then developed interactive environment objects, along with systems that allow the player to interact with them, such as picking up and using objects.\n\nTo support level design, I integrated Tiled with Phaser, enabling the use of external tilemaps for building and organizing game levels.\n\nFinally, I implemented UI elements and an item management system to handle player progression and inventory-related mechanics.", items: [
                         
                        ], layout: 'default'
                    },
                      
                       {
                        type: "carousel", label: "REFLECTION", text:  "Through this project, I learned the importance of organizing gameplay systems in a clear and scalable way. As more features were added, such as combat, object interaction, and item systems, managing how everything worked together became more complex.\n\nA key challenge was handling different states and interactions, especially when combining movement, combat, and object interaction. This made me realize how important a well-structured state machine is for managing player behavior.\n\nI also found that integrating tools like Tiled with Phaser required careful planning to keep the workflow efficient.\n\nIf I were to continue developing this project, I would focus on improving how systems are structured, making them easier to expand and maintain.", items: [
                         
                        ], layout: 'default'
                    },
                ],
                
            },
            {
                title: "Ronin Showdown",
                intro: "",
                thumbnail: "assets/images/portfolioContent/Game/roninShowdown/card.png",
                sections: [
                    { 
                        type: "carousel", 
                        text: 'Ronin Showdown is a two-player arcade-style fighting game with online multiplayer support. Built using a web-based architecture, the game allows players to connect and compete in real time.\n\nIt features core gameplay systems such as player movement, combat interactions, and real-time synchronization between clients. A backend built with Flask and Socket.IO handles communication and game state updates, while MongoDB is used for data storage.\n\nThe project explores how real-time networking and gameplay systems can be integrated to create a responsive and competitive multiplayer experience.',
                        items: [ 
                            { type: 'image', url: 'assets/images/portfolioContent/Game/roninShowdown/overview2.png' }, 
                            { type: 'image', url: 'assets/images/portfolioContent/Game/roninShowdown/overview5.png' },
                            { type: 'image', url: 'assets/images/portfolioContent/Game/roninShowdown/overview3.png' },
                            { type: 'image', url: 'assets/images/portfolioContent/Game/roninShowdown/overview1.png' }  
                        ],
                        layout: 'minimal' ,
                    },

                      {
                          type: "carousel", label: "PROCESS",
                          text: "The development process began by testing Socket.IO with a minimal prototype, using simple rectangles to verify that player positions could be synchronized correctly between two clients in real time.\n\nOnce movement synchronization was stable, combat-related inputs were gradually added and tested to ensure that attacks could also be transmitted and reflected consistently across both players.\n\nAfter validating the networking foundation, the core gameplay systems were implemented in JavaScript, followed by animation syncing to ensure that character actions were visually consistent during online play.\n\nThe next step was implementing a matchmaking system so that two players could connect and enter a match. Finally, MongoDB was integrated to support a leaderboard system for storing and displaying scores.", items: [
                         
                        ], layout: 'default'
                    },
                      
                       {
                           type: "carousel", label: "REFLECTION",
                           text: "Through this project, I realized that building a real-time multiplayer game is more challenging than it initially seems. Even basic features like movement and attacks required careful testing to make sure both players see consistent results.\n\nStarting with small prototypes was especially important. By first testing simple position synchronization, I could gradually build up more complex systems like combat and animation without breaking the core functionality.\n\nI also found that networking affects how gameplay is designed. Some ideas had to be simplified to ensure the game remained responsive and understandable for both players.\n\nOverall, this project helped me better understand how gameplay systems, networking, and backend logic come together in a complete interactive experience.", items: [
                         
                        ], layout: 'default'
                    },
                ],
                
            },

            // {
            //     title: "Vulpini",
            //     intro: "",
            //     thumbnail: "assets/images/portfolioContent/game/vulpini/card.png",
            //     sections: [
            //         { 
            //             type: "carousel", 
            //             text: 'Vulpini is a side-scrolling action platformer developed in Unreal Engine 5 using Blueprints. The project focuses on combining combat and platforming to create a fast-paced and responsive gameplay experience.\n\nPlayers navigate through levels that require precise movement, timing, and combat decisions, engaging with enemies while overcoming environmental challenges. The design emphasizes the balance between traversal and combat, encouraging players to adapt their actions based on the situation.\n\nThis project explores how level layout, enemy placement, and player abilities can work together to support fluid gameplay and engaging moment-to-moment interactions.',
            //             items: [ 
            //                 { type: 'image', url: 'assets/images/portfolioContent/game/vulpini/overview1.png' }, 
            //                 { type: 'image', url: 'assets/images/portfolioContent/game/vulpini/overview2.png' },
            //                 { type: 'image', url: 'assets/images/portfolioContent/game/vulpini/overview3.png' },
            //                 { type: 'image', url: 'assets/images/portfolioContent/game/vulpini/overview4.png' }  
            //             ],
            //             layout: 'minimal' ,
            //         },

            //           {
            //               type: "carousel", label: "PROCESS",
            //               text: "The development process began with importing sprites and setting up collision to establish the basic player representation in the game world.\n\nI then implemented player controls using Blueprints, allowing for movement, jumping, and core platforming interactions. This was followed by setting up animation systems to ensure smooth transitions between different player states.\n\nEnemy behaviors were implemented next, defining their interactions with the player and integrating them into combat encounters.\n\nI also developed UI elements to provide player feedback, along with item systems to support gameplay progression.\n\nFinally, I implemented level transitions to connect different sections of the game and complete the overall gameplay flow.", items: [
                         
            //             ], layout: 'default'
            //         },
                      
            //            {
            //                type: "carousel", label: "REFLECTION",
            //                text: "Through this project, I learned the importance of structuring gameplay systems clearly when working with Blueprints. As more features were added—such as movement, combat, enemies, and items—the complexity of managing interactions between systems increased. This highlighted the need for clean organization and modular design to keep the project maintainable.\n\nA key challenge was balancing platforming and combat. Combining these two elements required careful consideration of pacing, player control, and encounter design to ensure that neither aspect disrupted the overall gameplay flow.\n\nI also found that managing animation states and transitions became more complex as the number of player actions increased, reinforcing the importance of a well-structured state system.\n\nIf I were to further develop this project, I would focus on improving system modularity and refining the balance between combat and platforming to create a more cohesive experience.", items: [
                         
            //             ], layout: 'default'
            //         },
            //     ],
                
            // },
        ]
    },
    {
        id: "3D",
        title: "3D Modeling",
        label: "3D MODELING", 
        intro: "collection of blender project",
        projects: [
            {
                title: "3D Model",
                intro: "",
                thumbnail: "assets/images/portfolioContent/Model/model/card.png",
                sections: [
                    { 
                        type: "carousel", 
                        text: '',
                        items: [ 
                            { type: 'image', url: 'assets/images/portfolioContent/Model/model/1.png' }, 
                            { type: 'image', url: 'assets/images/portfolioContent/Model/model/2.png' },
                            { type: 'image', url: 'assets/images/portfolioContent/Model/model/3.png' },
                             
                        ],
                        layout: 'minimal' ,
                    },
                     { 
                        type: "carousel", 
                        text: '',
                        items: [ 
                            { type: 'image', url: 'assets/images/portfolioContent/Model/model/4.png' },
                            { type: 'image', url: 'assets/images/portfolioContent/Model/model/5.png' },
                            { type: 'image', url: 'assets/images/portfolioContent/Model/model/6.png' }  
                        ],
                        layout: 'minimal' ,
                    },
                     
                     {
                           type: "carousel", label: "PROCESS",
                           text: "The modeling process typically begins with a blockout stage, where basic shapes are established to define overall form and proportion. This step focuses on quickly exploring structure and spatial relationships without committing to detail. Once the general form is defined, I refine the model by adjusting proportions and improving shape clarity. At this stage, I pay close attention to how different elements relate to each other in space. Details are then added to enhance surface quality and visual interest, while maintaining consistency with the overall structure. Throughout the process, I iteratively evaluate and adjust the model to ensure that it remains visually coherent while exploring forms that go beyond real-world constraints.", items: [
                         
                        ], layout: 'default'
                    },
                     
                      {
                           type: "carousel", label: "REFLECTION",
                           text: "Through these works, I learned that even when moving beyond real-world constraints, strong underlying structure is still essential. Without a clear sense of form and proportion, more experimental shapes can quickly become visually unclear. I also found that balancing exploration and control is key. While 3D allows for freedom from physical limitations, maintaining a consistent visual logic helps make the work more readable and intentional.Another important takeaway was the value of iteration. Continuously adjusting shapes and proportions throughout the process helped refine the final result and improve overall coherence. Moving forward, I aim to further develop how I use form and structure to create more distinctive and intentional designs.", items: [
                                          ], layout: 'default'
                    },

                ],
                
            }


        ]
    },
    {
        id: "article",
        title: "About Me",
        label: "About Me", 
        intro: "collection of my articles about game",
        projects: [
            // {
            //     title: "RE4 Dynamic Difficulty Analysis",
            //     intro: "",
            //     thumbnail: "assets/images/portfolioContent/Article/RE4/card.jpg",
            //     sections: [
            //         {
            //             type: "carousel", label: "Mechanics Introduction",
            //             text: "In Resident Evil 4 Remake (a survival horror game), there is a dynamic difficulty mechanic that adjusts the game’s difficulty based on the player’s performance. For example, if the player collects a large amount of resources such as ammo or health kits, enemies become harder to kill, forcing the player to consume their saved resources. In contrast, if the player has a low amount of ammunition, enemies become easier to defeat, and containers are more likely to provide additional resources.",
            //             items: [
                         
            //             ], layout: 'default'
            //         },
            //         {
            //             type: "row", label: "How This Makes the Game More Interesting",
            //             text: "First, the dynamic difficulty system builds a feedback loop that keeps players of different skill levels within a state of flow. For highly skilled players, the loop works like this: collect resources, eliminate enemies efficiently, accumulate supplies, and repeat. However, as they accumulate more resources, the system increases enemy durability, forcing them to spend what they have saved. This prevents them from drifting into a boredom zone. At the same time, the limited backpack space acts as an additional balancing mechanism. Even if stronger enemies fail to reduce a player’s resources, inventory constraints force trade-offs. Players may sell items for money, but money can only be used to buy or upgrade weapons, not to directly restore what was sold. This ensures that resource management remains meaningful. For less skilled players, the loop is different. Because they struggle to conserve resources, they rarely approach a boredom zone. Instead, the system reduces enemy difficulty and increases drop rates, preventing them from falling too deeply into the anxiety zone. As a result, both player types are guided toward a stable flow state.In addition, this mechanic reinforces the horror experience. Because resource quantities always feel “just enough” to survive the next encounter, the situation remains uncertain. The player is never fully comfortable. This uncertainty sustains tension, which is essential in survival horror. Therefore, the dynamic difficulty system is not only a difficulty management tool, but also an experiential design tool.",
            //             img: "assets/images/portfolioContent/Article/RE4/3.png",
            //             reverse: false
            //         },
            //         {
            //             type: "carousel", label: "Where Have They Failed",
            //             text: "This mechanic can fail once the player becomes aware of it. If players realize that the system is secretly helping them, they may stop conserving resources. Instead, they might intentionally use more ammo, knowing that lower resource levels will trigger higher drop rates. When this happens, the system shifts from creating tension to becoming something that can be strategically manipulated. For example, if the player holds a large amount of ammunition, breaking a container may yield 200–500 pesetas. However, if the player’s total ammunition drops below 10 bullets, there is a much higher chance of receiving 10–20 bullets instead. Since each bullet can be sold for 120 pesetas, receiving 10 bullets equals 1200 pesetas, which is more than double the maximum monetary drop. As a result, a patient player could intentionally sell ammunition before breaking containers in order to maximize profit. In this case, the dynamic difficulty system unintentionally disrupts the game’s economic balance. Once the algorithm becomes predictable, it can be exploited.",
            //             items: [
                         
            //             ], layout: 'default'
            //         },
                   
            //     ]
            // }
            {
                title: "Artist Statement",
                intro: "",
                thumbnail: "assets/images/portfolioContent/card.jpg",
                sections: [
                    {
                        type: "carousel", label: "About Me",
                        text: "I’m a level design student based in Montreal, currently studying Computation Arts at Concordia University. I’m interested in how spaces guide players without relying on explicit instructions or UI. Instead of telling players where to go, I focus on how layout, light, and structure can naturally lead movement and decision-making. My work explores the relationship between exploration and readability. I design levels where players can discover paths, understand choices, and learn mechanics through the environment itself. Alongside level design, I also work with game engines such as Unity and Unreal Engine, as well as tools like Blender, to prototype and build interactive experiences.",
                        items: [
                         
                        ], layout: 'default'
                    },
                    {
                        type: "carousel", label: "Artist Statement",
                        text: "I design spaces that guide, rather than instruct.Growing up, I often felt disoriented in real-world environments, but rarely experienced that confusion in games. This contrast led me to question how virtual spaces communicate so effectively.My work focuses on how players understand and navigate space through visual cues such as layout, light, scale, and contrast. I explore how level design can create clarity without relying on text, markers, or explicit directions.Through iterative prototyping and playtesting, I study how players move, hesitate, and make decisions. These moments reveal whether a space is readable or not.I am particularly interested in designing environments where players feel a sense of agency — where choices are visible, paths are discoverable, and learning emerges through interaction with the space itself. Ultimately, my goal is to create experiences where players feel guided, never forced.",
                        items: [
                         
                        ], layout: 'default'
                    },
                   
                ]
            },
            {
                title: "Contact & Resume",
                intro: "",
                thumbnail: "assets/images/portfolioContent/card2.png",
                sections: [
                    {
                        type: "link",
                        label: "RESUME & CONTACT",
                        text: "Email: hejunming610@outlook.com\nPhone: 514-xxx-xxxx\n\nYou can view my full resume by clicking the button below.",
                        buttonText: "VIEW RESUME ONLINE",
                        url: "https://mega.nz/file/IMNEXJ7Y#-1waWqQOJZCy7QJuo5fNh1TRZ947iCdf3c4ManX0OYU" 
                    }
                ]
            },
        ]
    },
    
    
];