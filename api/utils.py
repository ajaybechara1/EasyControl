TRAINING_DATASET_PATH = "/media/ajaybechara1/AVANI/SEAS/efs/training_data/"

def train_user_model(user_token):
    # Importing the Keras libraries and packages
    import numpy as np
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Convolution2D
    from tensorflow.keras.layers import Dropout
    from tensorflow.keras.layers import MaxPooling2D
    from tensorflow.keras.layers import Flatten
    from tensorflow.keras.layers import Dense
    import sklearn as sklearn
    from sklearn.metrics import classification_report, confusion_matrix
    import tensorflowjs as tfjs
    import matplotlib.pyplot as plt
    import os


    training_data_path = TRAINING_DATASET_PATH + user_token + "/train_grey"
    testing_data_path = TRAINING_DATASET_PATH + user_token + "/test_grey"
    model_save_path = TRAINING_DATASET_PATH + user_token + "/model"

    gesture_count = len(os.listdir(training_data_path))



    # Step 1 - Building the CNN
    # Initializing the CNN
    classifier = Sequential()

    # First convolution layer and pooling
    classifier.add(Convolution2D(32, (3, 3), input_shape=(64, 64, 1), activation='relu'))
    classifier.add(MaxPooling2D(pool_size=(2, 2)))
    classifier.add(Dropout(0.5))

    # Second convolution layer and pooling
    classifier.add(Convolution2D(64, (3, 3), activation='relu'))
    # input_shape is going to be the pooled feature maps from the previous convolution layer
    classifier.add(MaxPooling2D(pool_size=(2, 2)))
    classifier.add(Dropout(0.5))

    classifier.add(Convolution2D(64, (3, 3), activation='relu'))
    classifier.add(MaxPooling2D(pool_size=(2, 2)))
    classifier.add(Dropout(0.5))

    classifier.add(Convolution2D(128, (3, 3), activation='relu'))
    classifier.add(MaxPooling2D(pool_size=(2, 2)))
    classifier.add(Dropout(0.5))

    # Flattening the layers
    classifier.add(Flatten())

    # Adding a fully connected layer
    classifier.add(Dense(units=128, activation='relu'))
    classifier.add(Dropout(0.5))
    classifier.add(Dense(units=gesture_count, activation='softmax')) # softmax for more than 2
    # classifier.add(Dense(units = 6, activation = 'sigmoid'))

    # Compiling the CNN
    classifier.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy']) # categorical_crossentropy for more than 2


    # Step 2 - Preparing the train/test data and training the model

    # Code copied from - https://keras.io/preprocessing/image/
    from keras.preprocessing.image import ImageDataGenerator

    train_datagen = ImageDataGenerator(
            rescale=1./255,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True)

    test_datagen = ImageDataGenerator(rescale=1./255)

    training_set = train_datagen.flow_from_directory(training_data_path,
                                                     target_size=(64, 64),
                                                     batch_size=5,
                                                     color_mode='grayscale',
                                                     class_mode='categorical')

    test_set = test_datagen.flow_from_directory(testing_data_path,
                                                target_size=(64, 64),
                                                batch_size=5,
                                                color_mode='grayscale',
                                                class_mode='categorical') 

    classifier.fit_generator(
            training_set,
            steps_per_epoch=20, # No of images in training set
            epochs=1,
            validation_data=test_set,
            validation_steps=5)# No of images in test set

    tfjs.converters.save_keras_model(classifier, model_save_path)

# train_user_model("data")

def rgb_to_grey_scale_source_to_target(source_path, target_path):
    import os
    import cv2

    files = os.listdir(source_path)

    for file in files:
        source_img_path = source_path + "/" + file
        target_img_path = target_path + "/" + file

        img = cv2.imread(source_img_path)
        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, img_gray = cv2.threshold(img_gray, 80, 255, cv2.THRESH_BINARY)

        cv2.imwrite(target_img_path, img_gray)


def rgb_to_grey_scale_for_given_token(user_token):
    import os

    token_directory_path = TRAINING_DATASET_PATH + user_token

    rgb_train_path = token_directory_path + "/train"
    rgb_test_path = token_directory_path + "/test"

    grey_train_path = token_directory_path + "/train_grey"
    grey_test_path = token_directory_path + "/test_grey"

    if not os.path.exists(grey_train_path):
        os.makedirs(grey_train_path)
    
    if not os.path.exists(grey_test_path):
        os.makedirs(grey_test_path)

    train_gesture_directory_list = os.listdir(rgb_train_path)

    for gesture_directry_name in train_gesture_directory_list:
        source_dir = rgb_train_path + "/" + gesture_directry_name
        target_dir = grey_train_path + "/" + gesture_directry_name
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
        rgb_to_grey_scale_source_to_target(source_dir, target_dir)

    test_gesture_directory_list = os.listdir(rgb_train_path)

    for gesture_directry_name in test_gesture_directory_list:
        source_dir = rgb_train_path + "/" + gesture_directry_name # change required in production  train -> test
        target_dir = grey_test_path + "/" + gesture_directry_name
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
        rgb_to_grey_scale_source_to_target(source_dir, target_dir)

# rgb_to_grey_scale_for_given_token("ABCDEF")


def train_model_with_token(user_token):
    rgb_to_grey_scale_for_given_token(user_token)
    train_user_model(user_token)
    return "DONE"
