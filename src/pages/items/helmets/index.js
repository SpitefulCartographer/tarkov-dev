import { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import {mdiRacingHelmet} from '@mdi/js';

import DataTable from '../../../components/data-table';
import formatPrice from '../../../modules/format-price';
import useStateWithLocalStorage from '../../../hooks/useStateWithLocalStorage';
import ArrowIcon from '../../../components/data-table/Arrow.js';
import {
    Filter,
    ToggleFilter,
    SliderFilter,
    InputFilter,
} from '../../../components/filter';
import {
    useItemsQuery,
    useItemsWithTypeQuery,
} from '../../../features/items/queries';

const materialDestructabilityMap = {
    Aramid: 0.25,
    Combined: 0.5,
    UHMWPE: 0.45,
    Titan: 0.55,
    Aluminium: 0.6,
    ArmoredSteel: 0.7,
    Ceramic: 0.8,
    Glass: 0.8,
};

const materialRepairabilityMap = {
    Aramid: 4,
    Combined: 3,
    UHMWPE: 6,
    Titan: 4,
    Aluminium: 4,
    ArmoredSteel: 5,
    Ceramic: 2,
    Glass: 1,
};

const ricochetMap = (ricochetCoefficient) => {
    if (ricochetCoefficient < 0.2) {
        return 'None';
    }

    if (ricochetCoefficient < 0.8) {
        return 'Low';
    }

    if (ricochetCoefficient < 0.9) {
        return 'Medium';
    }

    if (ricochetCoefficient < 1) {
        return 'High';
    }
};

const centerCell = ({ value }) => {
    return <div className="center-content">{value}</div>;
};

const centerNowrapCell = ({ value }) => {
    return <div className="center-content nowrap-content">{value}</div>;
};

const linkCell = (allData) => {
    return <a href={allData.row.original.itemLink}>{allData.value}</a>;
};

const marks = {
    1: 6,
    2: 5,
    3: 4,
    4: 3,
    5: 2,
    6: 1,
};

const getStatsString = (itemProperties) => {
    if (
        !itemProperties.speedPenaltyPercent &&
        !itemProperties.mousePenalty &&
        !itemProperties.weaponErgonomicPenalty
    ) {
        return '';
    }

    return `${itemProperties.speedPenaltyPercent || 0}% / ${
        itemProperties.mousePenalty || 0
    }% / ${itemProperties.weaponErgonomicPenalty || 0}`;
};

function Helmets(props) {
    const [includeBlockingHeadset, setIncludeBlockingHeadset] =
        useStateWithLocalStorage('includeBlockingHeadset', true);
    const [minArmorClass, setMinArmorClass] = useStateWithLocalStorage(
        'minHelmetArmorClass',
        6,
    );
    const [maxPrice, setMaxPrice] = useStateWithLocalStorage(
        'helmetMaxPrice',
        '',
    );
    const handleArmorClassChange = (newValueLabel) => {
        setMinArmorClass(newValueLabel);
    };
    const { data: items } = useItemsQuery();
    const { data: displayItems } = useItemsWithTypeQuery('helmet');
    const { t } = useTranslation();

    const columns = useMemo(
        () => [
            {
                id: 'expander',
                Header: ({
                    getToggleAllRowsExpandedProps,
                    isAllRowsExpanded,
                }) =>
                    // <span {...getToggleAllRowsExpandedProps()}>
                    //     {isAllRowsExpanded ? 'v' : '>'}
                    // </span>
                    null,
                Cell: ({ row }) =>
                    // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
                    // to build the toggle for expanding a row
                    row.canExpand ? (
                        <span
                            {...row.getToggleRowExpandedProps({
                                style: {
                                    // We can even use the row.depth property
                                    // and paddingLeft to indicate the depth
                                    // of the row
                                    // paddingLeft: `${row.depth * 2}rem`,
                                },
                            })}
                        >
                            {row.isExpanded ? (
                                <ArrowIcon />
                            ) : (
                                <ArrowIcon className={'arrow-right'} />
                            )}
                        </span>
                    ) : null,
            },
            {
                accessor: 'image',
                Cell: ({ value }) => {
                    return (
                        <div className="center-content">
                            <img
                                alt=""
                                className="table-image"
                                height="64"
                                loading="lazy"
                                src={value}
                                width="64"
                            />
                        </div>
                    );
                },
            },
            {
                Header: t('Name'),
                accessor: 'name',
                Cell: linkCell,
            },
            {
                Header: t('Armor class'),
                accessor: 'armorClass',
                Cell: centerCell,
            },
            {
                Header: t('Zones'),
                accessor: 'armorZone',
                Cell: centerCell,
            },
            // {
            //     Header: t('Ricochet chance'),
            //     accessor: 'ricochetChance',
            //     Cell: centerCell,
            // },
            {
                Header: t('Sound supression'),
                accessor: 'deafenStrength',
                Cell: centerCell,
            },
            {
                Header: t('Blocks earpiece'),
                accessor: 'blocksHeadphones',
                Cell: centerCell,
            },
            {
                Header: t('Max Durability'),
                accessor: 'maxDurability',
                Cell: centerCell,
            },
            // {
            //     Header: 'Effective Durability',
            //     accessor: 'effectiveDurability',
            //     Cell: centerCell,
            // },
            // {
            //     Header: 'Repairability',
            //     accessor: 'repairability',
            //     Cell: centerCell,
            // },
            {
                Header: ({ value }) => {
                    return (
                        <div className="center-content">
                            {t('Status')}
                            <div>{t('Mov/Turn/Ergo')}</div>
                        </div>
                    );
                },
                accessor: 'stats',
                Cell: centerNowrapCell,
            },
            {
                Header: t('Current Price'),
                accessor: 'price',
                Cell: centerCell,
            },
        ],
        [t],
    );

    const data = useMemo(
        () =>
            displayItems
                .map((item) => {
                    if (
                        !materialDestructabilityMap[
                            item.itemProperties.ArmorMaterial
                        ]
                    ) {
                        console.log(
                            `Missing ${item.itemProperties.ArmorMaterial}`,
                        );
                    }

                    if (item.itemProperties.armorClass < 7 - minArmorClass) {
                        return false;
                    }

                    if (
                        item.itemProperties.BlocksEarpiece &&
                        !includeBlockingHeadset
                    ) {
                        return false;
                    }

                    if (maxPrice && item.avg24hPrice > maxPrice) {
                        return false;
                    }

                    const match = item.name.match(/(.*)\s\(\d.+?$/);
                    let itemName = item.name;

                    if (match) {
                        itemName = match[1].trim();
                    }

                    return {
                        name: itemName,
                        armorClass: item.itemProperties.armorClass,
                        armorZone: item.itemProperties.headSegments?.join(', '),
                        material: item.itemProperties.ArmorMaterial,
                        deafenStrength: item.itemProperties.DeafStrength,
                        blocksHeadphones: item.itemProperties.BlocksEarpiece
                            ? 'Yes'
                            : 'No',
                        maxDurability: item.itemProperties.MaxDurability,
                        ricochetChance: ricochetMap(
                            item.itemProperties.RicochetParams?.x,
                        ),
                        repairability: `${
                            materialRepairabilityMap[
                                item.itemProperties.ArmorMaterial
                            ]
                        }`,
                        effectiveDurability: Math.floor(
                            item.itemProperties.MaxDurability /
                                materialDestructabilityMap[
                                    item.itemProperties.ArmorMaterial
                                ],
                        ),
                        stats: getStatsString(item.itemProperties),
                        price: formatPrice(item.avg24hPrice),
                        image:
                            item.iconLink ||
                            'https://tarkov.dev/images/unknown-item-icon.jpg',
                        wikiLink: item.wikiLink,
                        itemLink: `/item/${item.normalizedName}`,
                        subRows: item.linkedItems.map((linkedItemId) => {
                            const linkedItem = items.find(
                                (item) => item.id === linkedItemId,
                            );
                            return {
                                name: linkedItem.name,
                                armorClass: linkedItem.itemProperties.armorClass
                                    ? linkedItem.itemProperties.armorClass
                                    : '',
                                armorZone:
                                    linkedItem.itemProperties.headSegments?.join(
                                        ', ',
                                    ),
                                material:
                                    linkedItem.itemProperties.ArmorMaterial,
                                deafenStrength:
                                    linkedItem.itemProperties.DeafStrength,
                                blocksHeadphones: linkedItem.itemProperties
                                    .BlocksEarpiece
                                    ? 'Yes'
                                    : 'No',
                                maxDurability:
                                    linkedItem.itemProperties.MaxDurability,
                                ricochetChance: ricochetMap(
                                    linkedItem.itemProperties.RicochetParams?.x,
                                ),
                                repairability:
                                    materialRepairabilityMap[
                                        linkedItem.itemProperties.ArmorMaterial
                                    ],
                                effectiveDurability: Math.floor(
                                    linkedItem.itemProperties.MaxDurability /
                                        materialDestructabilityMap[
                                            linkedItem.itemProperties
                                                .ArmorMaterial
                                        ],
                                ),
                                stats: getStatsString(
                                    linkedItem.itemProperties,
                                ),
                                price: formatPrice(linkedItem.avg24hPrice),
                                image: `https://assets.tarkov.dev/${linkedItem.id}-icon.jpg`,
                                wikiLink: linkedItem.wikiLink,
                                itemLink: `/item/${linkedItem.normalizedName}`,
                            };
                        }),
                    };
                })
                .filter(Boolean),
        [minArmorClass, includeBlockingHeadset, maxPrice, displayItems, items],
    );

    return [
        <Helmet key={'helmet-table'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Helmets')}</title>
            <meta
                name="description"
                content="All helmets in Escape from Tarkov sortable by price, armor class etc"
            />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    <Icon path={mdiRacingHelmet} size={1.5} className="icon-with-text" /> 
                    {t('Helmets')}
                </h1>
                <Filter center>
                    <ToggleFilter
                        label={t('Show blocking headset')}
                        onChange={(e) =>
                            setIncludeBlockingHeadset(!includeBlockingHeadset)
                        }
                        checked={includeBlockingHeadset}
                    />
                    <SliderFilter
                        defaultValue={minArmorClass}
                        label={t('Min armor class')}
                        min={1}
                        max={6}
                        marks={marks}
                        reverse
                        onChange={handleArmorClassChange}
                    />
                    <InputFilter
                        defaultValue={maxPrice || ''}
                        label={t('Max price')}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        placeholder={t('Max price')}
                        type="number"
                    />
                </Filter>
            </div>

            <DataTable
                columns={columns}
                data={data}
                sortBy={'armorClass'}
                sortByDesc={true}
                autoResetSortBy={false}
            />

            <div className="page-wrapper" style={{ minHeight: 0 }}>
                <p>
                    {"In Escape from Tarkov, headgear serves a variety of functions."}
                    <br/>
                    {"There are useful objects, vanity items, and safety headgear. Before entering combat, choosing a helmet that will protect different parts of the head becomes crucial."}
                    <br/>
                    {"The impact that different helmets will have on how much sound they suppress is another crucial factor to take into account. Escape from Tarkov's gameplay heavily relies on sound."}
                    <br/>
                    {"Modular helmets, which have an assortment of different components, are another aspect of Escape from Tarkov. These helmets may modify the number of segments they protect. Top, Nape, Ears, Eyes, and Jaws are the segments."}
                </p>
            </div>
        </div>,
    ];
}

export default Helmets;
