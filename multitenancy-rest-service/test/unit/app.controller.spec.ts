import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { AuthService } from '@app/auth/auth.service';
import { RegisterTenantDto } from '@app/dto/register.tenant.dto';
import { PublicKeyCache } from '@app/auth/cache.publicKey';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import * as httpMocks from 'node-mocks-http';
import { Observable, of } from 'rxjs';

describe('Testing AppController', () => {
    let appController: AppController;
    let appService: AppService;
    let authService: AuthService;

    const mockRequest: Request = httpMocks.createRequest();
    const mockResponse: Response = httpMocks.createResponse();

    const mockTenantDetails = {
        id: 1,
        tenant_id: 1,
        tenant_name: 'string',
        description: 'string',
        createdDateTime: 'string',
        tenantDbName: 'string',
        host: 'string',
        port: 1,
    };

    const mockMessage = { Message: 'Testing' };

    const authToken = 'Bearer token';


    const mockAppService = {
        register: jest.fn(() => of(mockMessage)),
        getTenantConfig: jest.fn(() => of(mockTenantDetails)),
        clientIdSecret: jest.fn(),
        listAllTenant: jest.fn(() => of([mockTenantDetails])),
        connect: jest.fn().mockResolvedValue('connected'),
        updateDescription: jest.fn(() => of(mockTenantDetails)),
        deleteTenant: jest.fn(() => of(mockMessage)),
        createTable: jest.fn(() => of(mockMessage)),
        createRealm: jest.fn(),
        getAdminDetails: jest.fn(),
        createRedirectUrl: jest.fn(),
        createUser: jest.fn(),
        listAllUser: jest.fn(),
        userInfo: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
        createResource: jest.fn(),
        createPolicy: jest.fn(),
        createClient: jest.fn(),
        createRole: jest.fn(),
        getRoles: jest.fn(),
        roleInfo: jest.fn(),
        updateRole: jest.fn(),
        deleteRole: jest.fn(),
        createScope: jest.fn(),
        createPermission: jest.fn(),
        getPermissions: jest.fn(),
        updatePermission: jest.fn(),
        deletePermission: jest.fn()
    };

    const mockAuthService = {
        getAccessToken: jest.fn().mockResolvedValue('token'),
        logout: jest.fn().mockResolvedValue('204'),
        refreshAccessToken: jest.fn().mockResolvedValue('token'),
        getTenantName: jest.fn().mockResolvedValue('tenantName'),
        getUserName: jest.fn().mockResolvedValue('userName'),
        checkUserRole: jest.fn().mockResolvedValue(false),
        getPermissions: jest.fn().mockResolvedValue(['permission']),
        getpublicKey: jest.fn().mockResolvedValue('public-key'),
    };

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService, AuthService, PublicKeyCache],
        })
            .overrideProvider(AppService)
            .useValue(mockAppService)
            .overrideProvider(AuthService)
            .useValue(mockAuthService)
            .compile();

        appController = module.get<AppController>(AppController);
        appService = module.get<AppService>(AppService);
        authService = module.get<AuthService>(AuthService);
    });

    it('Testing appcontroller "login"', async () => {
        const mockBody = {
            username: 'username',
            password: process.env.TEST_PASSWORD,
            tenantName: 'tenantName',
            clientId: 'clientId',
            clientSecret: 'clientSecret',
        }
        const mockgetAccessToken = jest.spyOn(authService, 'getAccessToken');
        await appController.login(mockBody, mockResponse);
        expect(mockgetAccessToken).toHaveBeenCalled();
        mockgetAccessToken.mockRestore();
    });

    it('Testing appcontroller "when login failed"', async () => {
        const mockBody = {
            username: '',
            password: process.env.TEST_PASSWORD,
            tenantName: 'tenantName',
            clientId: 'clientId',
            clientSecret: 'clientSecret',
        }

        expect(async () => await appController.login(mockBody, mockResponse)).rejects.toThrow('Please enter userName');
        
    });

    it('Testing appcontroller "logout"', async () => {
        const mockBody = {
            tenantName: 'tenantName',
            refreshToken: 'refreshToken',
            clientId: 'clientId',
            clientSecret: 'clientSecret',
        }
        const mocklogout = jest.spyOn(authService, 'logout');
        await appController.logout(mockBody, mockResponse);
        expect(mocklogout).toHaveBeenCalled();
        mocklogout.mockRestore();
    });

    it('Testing appcontroller "refreshAccessToken"', async () => {
        const mockBody = {
            tenantName: 'tenantName',
            refreshToken: 'refreshToken',
            clientId: 'clientId',
            clientSecret: 'clientSecret',
        }
        const mockrefreshAccessToken = jest.spyOn(authService, 'refreshAccessToken');
        await appController.refreshAccessToken(mockBody, mockResponse);
        expect(mockrefreshAccessToken).toHaveBeenCalled();
        mockrefreshAccessToken.mockRestore();
    });

    it('Testing appcontroller "forgetPassword"', () => {
        mockRequest.query ={
            tenantName: 'tenantName'
        };
        const createRedirectUrl = jest.spyOn(appService, 'createRedirectUrl');
        appController.forgotPassword(mockRequest,mockResponse);
        expect(createRedirectUrl).toHaveBeenCalled();
        createRedirectUrl.mockRestore();
    });

    it('Testing appcontroller "publicKey"', async () => {
        mockRequest.params = {
            tenantName: 'tenantName'
        };
        const getpublicKey = jest.spyOn(authService, 'getpublicKey');
        await appController.publicKey(mockRequest, mockResponse);
        expect(getpublicKey).toHaveBeenCalled();
        getpublicKey.mockRestore();
    });

    it('Testing appcontroller "adminDetails"', async () => {
        mockRequest.headers = {
            authorization: authToken
        };

        const getAdminDetails = jest.spyOn(appService, 'getAdminDetails');
        await appController.adminDetails(mockRequest, mockResponse);
        expect(getAdminDetails).toHaveBeenCalled();
        getAdminDetails.mockRestore();
    });

    it('Testing appcontroller "registerTenant"', async () => {
        const mockBody: RegisterTenantDto = {
            tenantName: 'tenantName',
            userName: 'userName',
            email: 'tenant@email.com',
            password: process.env.TEST_PASSWORD,
            description: 'This is tenant Database',
            databaseName: 'tenant_db',
            databaseDescription: 'This is database description',
            clientDetails: { clientId: 'clientId' }
        }
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSubscribe = jest.spyOn(Observable.prototype, 'subscribe');
        const createRealm = jest.spyOn(appService, 'createRealm');
        const createClient = jest.spyOn(appService, 'createClient');
        await appController.registerTenant(mockBody, mockRequest, mockResponse);
        const { tenantName, userName, email, password, clientDetails, databaseName } = mockBody;
        expect(mockSubscribe).toHaveBeenCalled();
        expect(createRealm).toHaveBeenCalledWith(
            { tenantName, userName, email, password }, databaseName,
            mockRequest.headers['authorization']);
        expect(createClient).toHaveBeenCalledWith(
            { tenantName, clientDetails },
            mockRequest.headers['authorization']);
        mockSubscribe.mockRestore();
    });

    it('Testing appcontroller "getTenantConfig"', async () => {
        mockRequest.query = {
            tenantName: 'tenantName',
        };
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSubscribe = jest.spyOn(Observable.prototype, 'subscribe');
        const getTenantConfig = jest.spyOn(appService, 'getTenantConfig');
        await appController.getTenantConfig(mockRequest, mockResponse);
        expect(mockSubscribe).toHaveBeenCalled();
        expect(getTenantConfig).toHaveBeenCalledWith('tenantName');
        mockSubscribe.mockRestore();
    });

    it('Testing appcontroller "when getTenantConfig gets failed"', async () => {
        mockRequest.query = {
            tenantName: 'tenantname',
        };
        mockRequest.headers = {
            authorization: authToken
        };
        
        expect(async () => await appController.getTenantConfig(mockRequest, mockResponse)).rejects.toThrow("Not Allowed");   
    });

    it('Testing appcontroller "listAllTenant"', () => {
        mockRequest.query = {
            tenantName: 'tenantName',
            isDeleted: 'true',
            page: '1'
        };
        const mockSubscribe = jest.spyOn(Observable.prototype, 'subscribe');
        const listAllTenant = jest.spyOn(appService, 'listAllTenant');
        appController.listAllTenant(mockRequest, mockResponse);
        expect(mockSubscribe).toHaveBeenCalled();
        expect(listAllTenant).toHaveBeenCalledWith('tenantName', 'true','1');
        mockSubscribe.mockRestore();
    });

    it('Testing appcontroller "updateDescription"', async () => {
        mockRequest.body = {
            action: {
                tenantName: 'tenantName',
                description: 'newDescription'
            }
        };
        const mockSubscribe = jest.spyOn(Observable.prototype, 'subscribe');
        const updateDescription = jest.spyOn(appService, 'updateDescription');
        await appController.updateDescription(mockRequest, mockResponse);
        expect(updateDescription).toHaveBeenCalledWith('tenantName', 'newDescription');
        expect(mockSubscribe).toHaveBeenCalled();
        mockSubscribe.mockRestore();
    });

    it('Testing appcontroller "when updateDescription gets failed"', async () => {
        mockRequest.body = {
            action: {
                tenantName: '__',
                description: 'newDescription'
            }
        };
        expect(async () => await appController.updateDescription(mockRequest, mockResponse)).rejects.toThrow('Updation Not Allowed');
    });


    it('Testing appcontroller "deleteTenant"', async () => {
        mockRequest.params ={
            tenantName: 'tenantName'
        };

        mockRequest.headers = {
            authorization: 'Bearer token'
        };

        const mockSubscribe = jest.spyOn(Observable.prototype, 'subscribe');
        const deleteTenant = jest.spyOn(appService, 'deleteTenant');
        await appController.deleteTenant(mockRequest, mockResponse);
        expect(mockSubscribe).toHaveBeenCalled();
        expect(deleteTenant).toHaveBeenCalledWith('tenantName', mockRequest.headers['authorization']);
        mockSubscribe.mockRestore();
    });

    it('Testing appcontroller "tenantUser"', async () => {
        const mockBody = {
            tenantName: 'tenantName',
            userDetails: {
                userName: 'userName',
                email: 'tenant@gmail.com',
                password: process.env.TEST_PASSWORD,
                roles: ['role'],
                attributes: ['permission']
            }
        };
        mockRequest.body = {
            tenantName: '',
            password: process.env.TEST_PASSWORD,
            userDetails: {
                userName: 'userName',
                email: 'tenant@gmail.com',
                password: process.env.TEST_PASSWORD
            }
        };

        mockRequest.headers = {
            authorization: authToken
        };
        const mockSend = jest.spyOn(mockResponse, 'send');
        const createUser = jest.spyOn(appService, 'createUser');
        await appController.tenantUser(mockBody, mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(createUser).toHaveBeenCalledWith(mockRequest.body, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "listAllUser"', async () => {
        mockRequest.query = {
            tenantName: '',
            page: '1'
        };

        mockRequest.headers = {
            authorization: authToken
        };

        const mockSend = jest.spyOn(mockResponse, 'send');
        const listAllUser = jest.spyOn(appService, 'listAllUser');
        await appController.listAllUser(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(listAllUser).toHaveBeenCalledWith({
            query: mockRequest.query,
            token: mockRequest.headers['authorization']
        });
        mockSend.mockRestore();
    });

    it('Testing appcontroller "getUserInfo"', async () => {
        mockRequest.query = {
            tenantName: '',
            userName: 'userName',
        };

        mockRequest.headers = {
            authorization: authToken
        };

        const mockSend = jest.spyOn(mockResponse, 'send');
        const userInfo = jest.spyOn(appService, 'userInfo');
        await appController.getUserInfo(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(userInfo).toHaveBeenCalledWith(mockRequest.query, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "updateUser"', async () => {
        mockRequest.body = {
            tenantName: '',
            userName: 'userName',
            action: {
                firstName: 'firstName'
            }
        };

        mockRequest.headers = {
            authorization: authToken
        };

        const mockSend = jest.spyOn(mockResponse, 'send');
        const updateUser = jest.spyOn(appService, 'updateUser');
        await appController.updateUser(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(updateUser).toHaveBeenCalledWith(mockRequest.body, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "when updateUser gets failed"', async () => {
        mockRequest.body = {
            tenantName: 'tenantName',
            userName: '',
            action: {
                firstName: 'firstName'
            }
        };

        mockRequest.headers = {
            authorization: authToken
        };

        expect(async () => await appController.updateUser(mockRequest, mockResponse)).rejects.toThrow('Please enter userName');
    });

    it('Testing appcontroller "deleteUser"', async () => {
        mockRequest.params = {
            tenantName: 'tenantName',
            userName: 'username',
        };

        mockRequest.headers = {
            authorization: authToken
        };

        const mockSend = jest.spyOn(mockResponse, 'send');
        const deleteUser = jest.spyOn(appService, 'deleteUser');
        await appController.deleteUser(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(deleteUser).toHaveBeenCalledWith(mockRequest.params, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "when deleteUser gets failed"', async () => {
        mockRequest.params = {
            tenantName: 'tenantName',
            userName: 'userName',
        };

        mockRequest.headers = {
            authorization: authToken
        };

        expect(async () => await appController.deleteUser(mockRequest, mockResponse)).rejects.toThrow("Not Allowed");  
    });

    it('Testing appcontroller "tenantClient"', async () => {
        mockRequest.body = {
            tenantName: 'string',
            clientDetails: {
                clientId: "test-client",
                rootUrl: "www.testUrl.com",
            },
        };
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSend = jest.spyOn(mockResponse, 'send');
        const createClient = jest.spyOn(appService, 'createClient');
        await appController.tenantClient(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(createClient).toHaveBeenCalledWith(mockRequest.body, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "createRole"', async () => {
        mockRequest.body = {
            tenantName: 'tenantName',
            roleDetails: {
                name: 'string'
            }
        };
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSend = jest.spyOn(mockResponse, 'send');
        const createRoles = jest.spyOn(appService, 'createRole');
        await appController.createRole(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(createRoles).toHaveBeenCalledWith(mockRequest.body, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "when createRole gets failed"', async () => {
        mockRequest.body = {
            tenantName: '',
            roleDetails: {
                name: 'string'
            }
        };
        mockRequest.headers = {
            authorization: authToken
        };
        expect(async () => await appController.createRole(mockRequest, mockResponse)).rejects.toThrow("Please enter tenantName");
    });

    it('Testing appcontroller "getAvailableRoles"', async () => {
        mockRequest.query = {
            tenantName: '',
        };
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSend = jest.spyOn(mockResponse, 'send');
        const getRoles = jest.spyOn(appService, 'getRoles');
        await appController.getAvailableRoles(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(getRoles).toHaveBeenCalledWith('tenantName', mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "getRoleInfo"', async () => {
        mockRequest.query = {
            tenantName: 'tenantName',
            roleName: 'roleName'
        };
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSend = jest.spyOn(mockResponse, 'send');
        const roleInfo = jest.spyOn(appService, 'roleInfo');
        await appController.getRoleInfo(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(roleInfo).toHaveBeenCalledWith(mockRequest.query, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "when getRoleInfo tenantName get failed"', async () => {
        mockRequest.query = {
            tenantName: '',
            roleName: 'roleName'
        };
        mockRequest.headers = {
            authorization: authToken
        };

        expect(async () => await appController.getRoleInfo(mockRequest, mockResponse)).rejects.toThrow("Please enter tenantName");
    });

    it('Testing appcontroller "when getRoleInfo roleName get failed"', async () => {
        mockRequest.query = {
            tenantName: 'tenantName',
            roleName: ''
        };
        mockRequest.headers = {
            authorization: authToken
        };

        expect(async () => await appController.getRoleInfo(mockRequest, mockResponse)).rejects.toThrow("Please enter roleName");
    });

    it('Testing appcontroller "updateRole"', async () => {
        mockRequest.body = {
            tenantName: 'tenantName',
            roleName: 'roleName',
            action: {
                name: 'string'
            }
        };
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSend = jest.spyOn(mockResponse, 'send');
        const updateRoles = jest.spyOn(appService, 'updateRole');
        await appController.updateRole(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(updateRoles).toHaveBeenCalledWith(mockRequest.body, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "when updateRole tenantName gets failed"', async () => {
        mockRequest.body = {
            tenantName: '',
            roleName: 'roleName',
            action: {
                name: 'string'
            }
        };
        mockRequest.headers = {
            authorization: authToken
        };
    
        expect(async () => await appController.updateRole(mockRequest, mockResponse)).rejects.toThrow("Please enter tenantName");
    });

    it('Testing appcontroller "when updateRole roleName gets failed"', async () => {
        mockRequest.body = {
            tenantName: 'tenantName',
            roleName: '',
            action: {
                name: 'string'
            }
        };
        mockRequest.headers = {
            authorization: authToken
        };
    
        expect(async () => await appController.updateRole(mockRequest, mockResponse)).rejects.toThrow("Please enter roleName");
    });


    it('Testing appcontroller "deleteRole"', async () => {
        mockRequest.params = {
            tenantName: 'tenantName',
            roleName: 'roleName',
        };
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSend = jest.spyOn(mockResponse, 'send');
        const deleteRoles = jest.spyOn(appService, 'deleteRole');
        await appController.deleteRole(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(deleteRoles).toHaveBeenCalledWith(mockRequest.params, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "permission"', async () => {
        mockRequest.body = {
            tenantName: 'string',
            password: process.env.TEST_PASSWORD,
            clientName: 'string',
            permissionType: 'string',
            permissionDetails: {
                name: 'string'
            }
        }
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSend = jest.spyOn(mockResponse, 'send');
        const createPermission = jest.spyOn(appService, 'createPermission');
        await appController.permission(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(createPermission).toHaveBeenCalledWith(mockRequest.body, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "listPermission"', async () => {
        mockRequest.query = {
            tenantName: '',
            clientName: 'string',
        }
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSend = jest.spyOn(mockResponse, 'send');
        const getPermissions = jest.spyOn(appService, 'getPermissions');
        await appController.listPermission(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(getPermissions).toHaveBeenCalledWith(mockRequest.query, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "updatePermission"', async () => {
        mockRequest.body = {
            tenantName: 'string',
            clientName: 'string',
            permissionName: 'string',
            permissionType: 'string',
            permissionDetails: {
                name: 'string'
            }
        }
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSend = jest.spyOn(mockResponse, 'send');
        const updatePermission = jest.spyOn(appService, 'updatePermission');
        await appController.updatePermission(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(updatePermission).toHaveBeenCalledWith(mockRequest.body, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "deletePermission"', async () => {
        mockRequest.params = {
            tenantName: 'string',
            clientName: 'string',
            permissionName: 'string',
            permissionType: 'string',
        }
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSend = jest.spyOn(mockResponse, 'send');
        const deletePermission = jest.spyOn(appService, 'deletePermission');
        await appController.deletePermission(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(deletePermission).toHaveBeenCalledWith(mockRequest.params, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "resource"', async () => {
        mockRequest.body = {
            tenantName: 'string',
            password: process.env.TEST_PASSWORD,
            clientName: 'string',
            resourceDetails: { name: 'string' },
        };
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSend = jest.spyOn(mockResponse, 'send');
        const createResource = jest.spyOn(appService, 'createResource');
        await appController.resource(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(createResource).toHaveBeenCalledWith(mockRequest.body, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "policy"', async () => {
        mockRequest.body = {
            tenantName: 'string',
            password: process.env.TEST_PASSWORD,
            clientName: 'string',
            policyType: 'string',
            policyDetails: { name: 'string' },
        };
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSend = jest.spyOn(mockResponse, 'send');
        const createPolicy = jest.spyOn(appService, 'createPolicy');
        await appController.policy(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(createPolicy).toHaveBeenCalledWith(mockRequest.body, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "scope"', async () => {
        mockRequest.body = {
            tenantName: 'string',
            password: process.env.TEST_PASSWORD,
            clientName: 'string',
            scopeDetails: {
                name: 'string'
            }
        };
        mockRequest.headers = {
            authorization: authToken
        };
        const mockSend = jest.spyOn(mockResponse, 'send');
        const createScope = jest.spyOn(appService, 'createScope');
        await appController.scope(mockRequest, mockResponse);
        expect(mockSend).toHaveBeenCalled();
        expect(createScope).toHaveBeenCalledWith(mockRequest.body, mockRequest.headers['authorization']);
        mockSend.mockRestore();
    });

    it('Testing appcontroller "connectDatabase"', async () => {
        mockRequest.query = {
            host: 'host',
            port: '3306',
            tenantName: 'tenantName',
            password: process.env.TEST_PASSWORD,
            dbName: 'tenant_db'
        }

        mockRequest.headers = {
            authorization: authToken
        };

        const connect = jest.spyOn(appService, 'connect');
        await appController.connectDatabase(mockRequest, mockResponse);
        expect(connect).toHaveBeenCalled();
        connect.mockRestore();
    });

    it('Testing appcontroller "when connectDatabase method gets failed"', async () => {
        mockRequest.query = {
            host: 'host',
            port: '3306',
            tenantName: '',
            password: process.env.TEST_PASSWORD,
            dbName: 'tenant_db'
        }

        mockRequest.headers = {
            authorization: authToken
        };

        expect(async () => await appController.connectDatabase(mockRequest, mockResponse)).rejects.toThrow("Updation Not Allowed");
       
    });

    it('Testing appcontroller "createTable"', async () => {
        const mockSubscribe = jest.spyOn(Observable.prototype, 'subscribe');
        await appController.createTable(mockRequest, mockResponse);
        expect(mockSubscribe).toHaveBeenCalled();
        mockSubscribe.mockRestore();
    });
});
