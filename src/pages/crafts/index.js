import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import CraftsTable from '../../components/crafts-table';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';
import {
    Filter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
    ToggleFilter,
} from '../../components/filter';
import capitalizeTheFirstLetterOfEachWord from '../../modules/capitalize-first';

import Icon from '@mdi/react';
import { mdiProgressWrench } from '@mdi/js';

import './index.css';

const stations = [
    'booze-generator',
    // 'christmas-tree',
    'intelligence-center',
    'lavatory',
    'medstation',
    'nutrition-unit',
    'water-collector',
    'workbench',
];

function Crafts() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [freeFuel, setFreeFuel] = useState(false);
    const [averagePrices, setAveragePrices] = useStateWithLocalStorage(
        'averageCraftingPrices',
        true,
    );
    const [selectedStation, setSelectedStation] = useStateWithLocalStorage(
        'selectedStation',
        'top',
    );
    const [showAll, setShowAll] = useState(false);
    const { t } = useTranslation();

    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Hideout Crafts')}</title>
            <meta
                name="description"
                content="Escape from Tarkov Hideout Craft Profits"
            />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="crafts-headline-wrapper" key="crafts-filters">
                <h1 className="crafts-page-title">
                    <Icon path={mdiProgressWrench} size={1.5} className="icon-with-text"/>
                    {t('Hideout Crafts')}
                </h1>
                <Filter>
                    <ToggleFilter
                        checked={showAll}
                        label={t('Ignore settings')}
                        onChange={(e) => setShowAll(!showAll)}
                        tooltipContent={
                            <div>
                                {t(
                                    'Shows all crafts regardless of what you have set in your settings',
                                )}
                            </div>
                        }
                    />
                    <ToggleFilter
                        checked={averagePrices}
                        label={t('Average prices')}
                        onChange={(e) => setAveragePrices(!averagePrices)}
                        tooltipContent={
                            <div>
                                {t(
                                    'Use average prices from the past 24 hours for profit calculations',
                                )}
                            </div>
                        }
                    />
                    <ButtonGroupFilter>
                        {stations.map((stationName) => {
                            return (
                                <ButtonGroupFilterButton
                                    key={`station-tooltip-${stationName}`}
                                    tooltipContent={
                                        <div>
                                            {t(
                                                capitalizeTheFirstLetterOfEachWord(
                                                    stationName.replace('-', ' '),
                                                ),
                                            )}
                                        </div>
                                    }
                                    selected={stationName === selectedStation}
                                    content={
                                        <img
                                            alt={stationName}
                                            loading="lazy"
                                            title={stationName}
                                            src={`${process.env.PUBLIC_URL}/images/${stationName}-icon.png`}
                                        />
                                    }
                                    onClick={setSelectedStation.bind(
                                        undefined,
                                        stationName,
                                    )}
                                />
                            );
                        })}
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <div>
                                    {t('Most profitable craft in each station')}
                                </div>
                            }
                            selected={selectedStation === 'top'}
                            content={t('Best')}
                            onClick={setSelectedStation.bind(undefined, 'top')}
                        />
                    </ButtonGroupFilter>
                    <ToggleFilter
                        checked={freeFuel}
                        label={t('Empty fuel')}
                        onChange={(e) => setFreeFuel(!freeFuel)}
                        tooltipContent={
                            <div>
                                {t(
                                    'Sets fuel canister cost to 0 for crafts requiring fuel canisters when using non-FIR fuel canisters from generator.',
                                )}
                            </div>
                        }
                    />
                    <InputFilter
                        defaultValue={nameFilter || ''}
                        label={t('Item filter')}
                        type={'text'}
                        placeholder={t('filter on item')}
                        onChange={(e) => setNameFilter(e.target.value)}
                    />
                </Filter>
            </div>

            <CraftsTable
                nameFilter={nameFilter}
                freeFuel={freeFuel}
                showAll={showAll}
                averagePrices={averagePrices}
                selectedStation={selectedStation}
                key="crafts-page-crafts-table"
            />

            <div className="page-wrapper" style={{ minHeight: 0 }}>
                <p>
                    {"In Escape from Tarkov, crafts allow you create a variety of things. It is accomplished using a variety of hideout modules, including the water collector, workbench, medstation, lavatory, and nutrition unit."}<br/>
                    <br/>
                    {"The \"found in raid\" status will be applied to each item created in the hideout. The entire list of these crafts is shown above. The Crafting skill has an impact on item creation time."}<br/>
                    <br/>
                    {"When an item's icon has a blue border, it will be utilized as an auxiliary tool and, once manufacturing is finished, it will be returned to your stash."}
                </p>
            </div>
        </div>
    ];
}

export default Crafts;
