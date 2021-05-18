export enum Errors {
    EMPTY_BODY_MESSAGE = 'Invalid request. Are you missing the body?',
    EMPTY_REQUIRED_FIELD = 'Invalid request. Are you missing required fields?',
    INTERNAL_SERVER_ERROR = 'Internal server error. Please contact support.',
    EMPTY_PARAMETER = 'Invalid request. Are you missing the parameter?',
    NOT_FOUND = 'Requested record cannot be found',
    NO_ARGUMENTS_PROVIDED = 'Invalid request. No arguments provided.',
}