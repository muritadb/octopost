import { octopostApi } from '~services/api';
import { AccountsService } from '~services/api/accounts/accounts';
import { Account } from '~services/api/accounts/accounts.types';
import { SocialMediaService } from '~services/api/social-media/social-media';
import { SocialMedia } from '~services/api/social-media/social-media.types';

import { create } from '../zustand';

import {
  NewAccount,
  SocialMediaData,
  SocialMediaState,
  StoreAccount,
} from './useSocialMediaStore.types';

export const useSocialMediaStore = create<SocialMediaState>((set) => ({
  accounts: {
    data: {},
    error: '',
    loading: false,
  },
  addAccount: async (newAccount: NewAccount): Promise<StoreAccount> => {
    set((state) => ({ accounts: { ...state.accounts, loading: true } }));

    const res = await octopostApi.post('/accounts', newAccount);
    const addedAccount: StoreAccount = { ...res.data, valid: false };

    set((state) => {
      const currentAccounts = state.accounts.data[addedAccount.socialMediaId];

      const newAccounts = currentAccounts ?? [addedAccount];

      return {
        accounts: {
          ...state.accounts,
          data: {
            ...state.accounts.data,
            [addedAccount.socialMediaId]: newAccounts,
          },
          loading: false,
        },
      };
    });

    return addedAccount;
  },

  favoriteAccount: async (
    accountId: Account['id'],
    favorite: boolean
  ): Promise<void> => {
    const account = await AccountsService.favorite(accountId, favorite);

    if (account) {
      const favoritedAccount: StoreAccount = {
        ...account,
        favorite,
        valid: false,
      };

      set((state) => ({
        favoriteAccounts: [...state.favoriteAccounts, favoritedAccount],
      }));
    }
  },

  favoriteAccounts: [],

  getAllAccounts: async (): Promise<void> => {
    set((state) => ({ accounts: { ...state.accounts, loading: true } }));

    const fetchedAccounts: Account[] = await AccountsService.fetchAll();

    const userSocialMedias: string[] = [];
    const accountsBySocialMedia: SocialMediaData = {
      data: {},
    };

    accountsBySocialMedia.data = fetchedAccounts.reduce(
      (agg, account) => ({
        ...agg,
        [account.socialMediaId]: [
          ...(agg[account.socialMediaId] ?? []),
          {
            ...account,
            valid: true,
          },
        ],
      }),
      accountsBySocialMedia.data
    );

    const fetchedSocialMedias =
      await SocialMediaService.fetch(userSocialMedias);

    const fetchedSocialMediasMap = new Map<SocialMedia['id'], SocialMedia>();

    for (const socialMedia of fetchedSocialMedias) {
      fetchedSocialMediasMap.set(socialMedia.id, socialMedia);
    }

    const favoriteAccounts = fetchedAccounts
      .filter((account) => account.favorite)
      .map((account) => ({
        ...account,
        valid: true,
      }));

    set(() => ({
      accounts: {
        data: accountsBySocialMedia.data,
        error: '',
        loading: false,
      },
      favoriteAccounts,
      socialMedias: fetchedSocialMediasMap,
    }));
  },

  socialMedias: new Map<string, SocialMedia>(),
}));

void useSocialMediaStore.getState().getAllAccounts();
