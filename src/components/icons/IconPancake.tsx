import React from 'react';

const IconPancake = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" {...props}>
            <circle cx="50" cy="58" r="42" fill="#E8F7FF" />
            <circle cx="50" cy="58" r="38" fill="#FFFFFF" stroke="#D1E9F8" strokeWidth="0.5"/>
            <ellipse cx="50" cy="80" rx="30" ry="5" fill="#000000" opacity="0.1" />
            <path d="M20,75 C20,85 80,85 80,75 C80,65 20,65 20,75 Z" fill="#E4A853" stroke="#C68E46" strokeWidth="0.75"/>
            <path d="M22,68 C22,78 78,78 78,68 C78,58 22,58 22,68 Z" fill="#E4A853" stroke="#C68E46" strokeWidth="0.75"/>
            <path d="M25,61 C25,71 75,71 75,61 C75,51 25,51 25,61 Z" fill="#F0B86E" stroke="#C68E46" strokeWidth="0.75"/>
            <path d="M28,60 C 20,62 30,45 45,45 C 60,45 70,60 72,60 Q 75,65 73,68 Q 70,72 67,68 C 65,65 66,62 66,62 C 66,62 60,55 50,55 C 40,55 35,62 35,62 Q 32,66 29,67 Q 26,67 28,60 Z" fill="#BF692A"/>
            <path d="M 68,68 C 68,75 65,75 65,68 Z" fill="#BF692A" />
            <path d="M 35,62 C 32,70 30,70 31,62 Z" fill="#BF692A" />
            <path d="M 50,55 C 50,65 48,65 48,55 Z" fill="#BF692A" />
            <rect x="42" y="40" width="16" height="12" fill="#FFEEA4" rx="2" ry="2" transform="rotate(-5 50 46)"/>
            <rect x="44" y="38" width="12" height="4" fill="#FFF8D4" rx="1" ry="1" transform="rotate(-5 50 40)"/>
            <g transform="translate(65, 5) scale(0.7) rotate(15)">
                <rect x="30" y="30" width="50" height="14" rx="3" ry="3" fill="#B0E0E6" stroke="#5F9EA0" strokeWidth="0.7" opacity="0.8"/>
                <rect x="32" y="32" width="45" height="10" rx="2" ry="2" fill="#BF692A"/>
                <rect x="75" y="34" width="20" height="6" fill="#D3D3D3" stroke="#A9A9A9" strokeWidth="0.5"/>
                <rect x="95" y="31" width="5" height="12" rx="2" ry="2" fill="#C0C0C0" stroke="#808080" strokeWidth="0.5"/>
                <rect x="25" y="33" width="5" height="8" fill="#B0E0E6" stroke="#5F9EA0" strokeWidth="0.7"/>
                <line x1="25" y1="37" x2="15" y2="37" stroke="#808080" strokeWidth="1.5" strokeLinecap="round"/>
            </g>
    </svg>
);

export default IconPancake;
