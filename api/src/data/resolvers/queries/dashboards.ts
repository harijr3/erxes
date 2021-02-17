import { DashboardItems, Dashboards } from '../../../db/models';
import {
  DashboardFilters,
  DashboardFilterTypes
} from '../../dashboardConstants';
import {
  getBoards,
  getBrands,
  getIntegrations,
  getPipelines,
  getTags,
  getUsers
} from '../../modules/dashboard/utils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate } from '../../utils';

const dashBoardQueries = {
  dashboards(
    _root,
    args: { page: number; perPage: number },
    { commonQuerySelector }: IContext
  ) {
    return paginate(Dashboards.find(commonQuerySelector), args);
  },

  dashboardDetails(_root, { _id }: { _id: string }) {
    return Dashboards.findOne({ _id });
  },

  dashboardsTotalCount() {
    return Dashboards.find({}).countDocuments();
  },

  async dashboardItems(_root, { dashboardId }: { dashboardId: string }) {
    return DashboardItems.find({ dashboardId });
  },

  dashboardItemDetail(_root, { _id }: { _id: string }) {
    return DashboardItems.findOne({ _id });
  },

  async dashboardInitialDatas(
    _root,
    { type }: { type: string },
    { dataSources }: IContext
  ) {
    return dataSources.HelpersApi.fetchApi('/get-dashboards', { type });
  },

  async dashboardFilters(_root, { type }: { type: string }) {
    const filters = DashboardFilters[type];

    if (!filters) {
      if (type.includes('pipeline')) {
        return getPipelines();
      }

      if (DashboardFilterTypes.User.some(name => type.includes(name))) {
        return getUsers();
      }

      if (type.includes('brand')) {
        return getBrands();
      }

      if (type.includes('integrationName')) {
        return getIntegrations();
      }

      if (type.includes('board')) {
        return getBoards();
      }

      if (type.includes('tag')) {
        let tagType = 'conversation';

        if (type.split('.')[0] === 'Contacts') {
          tagType = 'customer';
        }

        if (type.split('.')[0] === 'Companies') {
          tagType = 'company';
        }

        return getTags(tagType);
      }
    }

    return filters;
  }
};

checkPermission(dashBoardQueries, 'dashboards', 'showDashboards', []);

export default dashBoardQueries;
