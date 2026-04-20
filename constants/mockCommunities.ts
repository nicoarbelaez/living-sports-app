import { Community } from '@/types/community';

export let mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Press Banca Elite',
    followersCount: 12400,
    avatarUrl:
      'https://images.unsplash.com/photo-1552674605-db6aea4df46f?auto=format&fit=crop&q=80&w=200',
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Gym Warriors',
    followersCount: 8900,
    avatarUrl:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '3',
    name: 'Deadlift Kings',
    followersCount: 45200,
    avatarUrl:
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '4',
    name: 'Iron Squad',
    followersCount: 5600,
    avatarUrl:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '5',
    name: 'Squat Nation',
    followersCount: 15300,
    avatarUrl:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '6',
    name: 'Arnold Classic',
    followersCount: 7800,
    avatarUrl:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '7',
    name: 'Powerlifting MX',
    followersCount: 22100,
    avatarUrl:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '8',
    name: 'Calisthenics Pro',
    followersCount: 3400,
    avatarUrl:
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&q=80&w=200',
  },
];

export const addMockCommunity = (community: Community) => {
  mockCommunities = [community, ...mockCommunities];
};
