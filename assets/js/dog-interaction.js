document.addEventListener('DOMContentLoaded', () => {
    const annoyingDog = document.getElementById('annoying-dog');
    
    if (annoyingDog) {
        const chewingGif = 'https://static.wikia.nocookie.net/undertale/images/7/7d/Annoying_Dog_sprite_bone.gif/';
        const shockedGif = 'https://static.wikia.nocookie.net/undertale/images/8/8e/Annoying_Dog_battle_surprised.png';

        annoyingDog.addEventListener('click', () => {
            // Change to the shocked GIF
            annoyingDog.src = shockedGif;
            
            // After 1.5 seconds, change back to the chewing GIF
            setTimeout(() => {
                annoyingDog.src = chewingGif;
            }, 1500);
        });
    }
});