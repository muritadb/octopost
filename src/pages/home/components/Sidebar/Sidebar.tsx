import React, { ReactNode, useRef, useState } from 'react';

import classNames from 'classnames';
import debounce from 'lodash.debounce';
import groupBy from 'lodash.groupby';
import isEmpty from 'lodash.isempty';

import useKeyPress from '~hooks/useKeyPress/useKeyPress';
import { useSocialMediaStore } from '~stores/useSocialMediaStore';
import { StoreAccount } from '~stores/useSocialMediaStore.types';

import AccordionTab from '~components/AccordionTab/AccordionTab';
import Button from '~components/Button/Button';
import Icon from '~components/Icon/Icon';
import InputSearch from '~components/InputSearch/InputSearch';
import { TInputComponent } from '~components/InputSearch/InputSearch.types';
import Modal from '~components/Modal/Modal';

import SocialAccordion from './components/SocialAccordion/SocialAccordion';

import scss from './Sidebar.module.scss';

const HALF_SECOND = 500;

const format = (userName: string): string => userName.toLowerCase().trim();

function Sidebar(): React.ReactNode {
  const { accounts, addAccount } = useSocialMediaStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileIsOpen, setMobileIsOpen] = useState(false);
  const [selectSocialMedia, setSelectSocialMedia] = useState(
    'Selecione uma rede social'
  );
  const inputSearchRef = useRef<TInputComponent | null>(null);
  const isEmptyResult = isEmpty(filteredAccounts) && inputValue;

  const handleToggleModal = (): void => {
    setIsOpen((prev) => !prev);
  };

  const handleSelectSocialMedia = (addonId: string): void => {
    addAccount(addonId);
    setIsOpen(false);
  };

  const getAccounts = (): StoreAccount[] =>
    isEmpty(filteredAccounts) ? accounts : filteredAccounts;

  const debouncedSearch = debounce((value: string): void => {
    const userName = format(value);
    const filtered = accounts.filter((account) =>
      format(account.userName).includes(userName)
    );

    setInputValue(value);
    setFilteredAccounts(filtered);
  }, HALF_SECOND);

  const renderEmptyResult = (): ReactNode => (
    <p> Não há resultados para essa busca</p>
  );
  const renderSearchData = (): ReactNode => (
    <div className={scss.accordionContainer}>
      {Object.entries(groupBy(getAccounts(), 'socialMediaId')).map(
        ([socialMediaId, socialMediaAccounts]) => (
          <SocialAccordion
            accounts={socialMediaAccounts}
            error={false}
            key={socialMediaId}
            socialMediaId={socialMediaId}
          />
        )
      )}
    </div>
  );

  useKeyPress('Escape', (e: KeyboardEvent) => {
    e.preventDefault();
    setIsOpen(false);
  });

  return (
    <div className={scss.container}>
      <AccordionTab
        className={classNames(scss.mobile, [scss.openMobile])}
        hideCloseButton
        isOpen
        title="Select Social Media"
      >
        <div className={scss.content}>
          <InputSearch
            error={false}
            onChange={debouncedSearch}
            placeholder="Search for social media"
            ref={inputSearchRef}
          />

          {isEmptyResult ? renderEmptyResult() : renderSearchData()}

          <div className={scss.newAccountButtonMobileContainer}>
            <Button
              className={scss.newAccountButton}
              onClick={handleToggleModal}
              variant="container"
            >
              + New Account
            </Button>
            <div className={scss.newAccountButtonMobileContainer}>
              <Button
                circle
                className={scss.newAccountButtonMobile}
                icon={<Icon icon="plus" size={16} />}
                onClick={handleToggleModal}
                variant="container"
              />
            </div>
            <Modal
              className="$ternarygray"
              isOpen={isOpen}
              onClickOutside={() => setIsOpen(false)}
            >
              <select
                onChange={(e) => setSelectSocialMedia(e.target.value)}
                value={selectSocialMedia}
              >
                <option>{selectSocialMedia}</option>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
            </Modal>
          </div>
        </div>
      </AccordionTab>
    </div>
  );
}

export default Sidebar;
